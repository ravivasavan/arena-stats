import { dayKey, monthKey } from './format'

export const BLOCK_TYPES = ['Image', 'Link', 'Text', 'Attachment', 'Embed']

/** Day number that ignores DST, so consecutive-day maths stays honest. */
function daySerial(key) {
  const [y, m, d] = key.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86_400_000
}

function topEntries(counter, limit) {
  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }))
}

function streaks(sortedDayKeys) {
  if (!sortedDayKeys.length) {
    return { longest: 0, longestStart: null, longestEnd: null, current: 0 }
  }

  let longest = 1
  let longestStart = sortedDayKeys[0]
  let longestEnd = sortedDayKeys[0]
  let runLength = 1
  let runStart = sortedDayKeys[0]

  for (let i = 1; i < sortedDayKeys.length; i++) {
    const contiguous =
      daySerial(sortedDayKeys[i]) - daySerial(sortedDayKeys[i - 1]) === 1
    runLength = contiguous ? runLength + 1 : 1
    runStart = contiguous ? runStart : sortedDayKeys[i]
    if (runLength > longest) {
      longest = runLength
      longestStart = runStart
      longestEnd = sortedDayKeys[i]
    }
  }

  // A streak still counts as "current" if today hasn't been used yet.
  const today = daySerial(dayKey(new Date()))
  const last = daySerial(sortedDayKeys[sortedDayKeys.length - 1])
  let current = 0
  if (today - last <= 1) {
    current = 1
    for (let i = sortedDayKeys.length - 1; i > 0; i--) {
      if (daySerial(sortedDayKeys[i]) - daySerial(sortedDayKeys[i - 1]) === 1) current++
      else break
    }
  }

  return { longest, longestStart, longestEnd, current }
}

function monthlySeries(byMonth, firstDate, lastDate) {
  const series = []
  const cursor = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
  const end = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1)
  while (cursor <= end && series.length < 600) {
    const key = monthKey(cursor)
    series.push({
      key,
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      count: byMonth[key] ?? 0,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return series
}

export function computeBlockStats(blocks, meta = {}) {
  const { totalCount = blocks.length, truncated = false, complete = true } = meta

  if (!blocks.length) {
    return { total: 0, sampled: 0, truncated, complete, empty: true }
  }

  const byType = {}
  const byVisibility = {}
  const byYear = {}
  const byYearAndType = {}
  const byMonth = {}
  const calendar = {}
  const byWeekday = new Array(7).fill(0)
  const byHour = new Array(24).fill(0)
  const hosts = {}
  const extensions = {}
  const storageByType = {}

  let totalBytes = 0
  let totalWords = 0
  let totalComments = 0
  let blocksWithComments = 0
  let titled = 0
  let portrait = 0
  let landscape = 0
  let square = 0
  let earliest = null
  let latest = null

  for (const block of blocks) {
    byType[block.type] = (byType[block.type] || 0) + 1
    if (block.visibility) {
      byVisibility[block.visibility] = (byVisibility[block.visibility] || 0) + 1
    }

    const created = new Date(block.createdAt)
    if (!Number.isNaN(created.getTime())) {
      const year = created.getFullYear()
      byYear[year] = (byYear[year] || 0) + 1
      byYearAndType[year] = byYearAndType[year] || {}
      byYearAndType[year][block.type] = (byYearAndType[year][block.type] || 0) + 1

      const mKey = monthKey(created)
      byMonth[mKey] = (byMonth[mKey] || 0) + 1

      const dKey = dayKey(created)
      calendar[dKey] = (calendar[dKey] || 0) + 1

      byWeekday[created.getDay()]++
      byHour[created.getHours()]++

      if (!earliest || created < earliest.date) earliest = { date: created, block }
      if (!latest || created > latest.date) latest = { date: created, block }
    }

    if (block.host) hosts[block.host] = (hosts[block.host] || 0) + 1
    if (block.ext) extensions[block.ext] = (extensions[block.ext] || 0) + 1

    // Link and Embed blocks carry a fetched preview image. Only Image and
    // Attachment blocks represent something the user actually uploaded.
    const isUpload = block.type === 'Image' || block.type === 'Attachment'
    if (block.size && isUpload) {
      totalBytes += block.size
      storageByType[block.type] = (storageByType[block.type] || 0) + block.size
    }

    totalWords += block.words || 0
    totalComments += block.comments || 0
    if (block.comments > 0) blocksWithComments++
    if (block.title) titled++

    // Same reasoning: only judge the shape of images the user uploaded.
    if (block.aspect && block.type === 'Image') {
      if (block.aspect < 0.95) portrait++
      else if (block.aspect > 1.05) landscape++
      else square++
    }
  }

  // Are.na can return types we don't know about (PendingBlock, and whatever
  // comes next). Keep the familiar order, then append anything unexpected so
  // it still shows up in the charts instead of vanishing.
  const typeOrder = [
    ...BLOCK_TYPES.filter((type) => byType[type]),
    ...Object.keys(byType)
      .filter((type) => !BLOCK_TYPES.includes(type))
      .sort((a, b) => byType[b] - byType[a]),
  ]

  const dayKeys = Object.keys(calendar).sort()
  const activeDays = dayKeys.length
  const busiestDayKey = dayKeys.reduce(
    (best, key) => (calendar[key] > (calendar[best] ?? -1) ? key : best),
    dayKeys[0],
  )

  const now = new Date()
  const thisYear = now.getFullYear()
  const daysSince = (days) => new Date(now.getTime() - days * 86_400_000)
  const cutoff30 = daysSince(30)
  const cutoff90 = daysSince(90)
  const cutoff365 = daysSince(365)

  let last30 = 0
  let last90 = 0
  let last365 = 0
  let lastYearToDate = 0
  const lastYearCutoff = new Date(now)
  lastYearCutoff.setFullYear(thisYear - 1)

  for (const block of blocks) {
    const created = new Date(block.createdAt)
    if (Number.isNaN(created.getTime())) continue
    if (created >= cutoff30) last30++
    if (created >= cutoff90) last90++
    if (created >= cutoff365) last365++
    if (created.getFullYear() === thisYear - 1 && created <= lastYearCutoff) lastYearToDate++
  }

  const lifetimeDays = earliest
    ? Math.max(1, Math.round((now - earliest.date) / 86_400_000))
    : 1

  const months = monthlySeries(byMonth, earliest?.date ?? now, latest?.date ?? now)
  const busiestMonth = months.reduce(
    (best, m) => (m.count > (best?.count ?? -1) ? m : best),
    null,
  )

  const largestFiles = blocks
    .filter((b) => b.size > 0 && (b.type === 'Image' || b.type === 'Attachment'))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)

  const mostDiscussed = blocks
    .filter((b) => b.comments > 0)
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 5)

  return {
    empty: false,
    total: totalCount,
    sampled: blocks.length,
    truncated,
    complete,

    byType,
    typeOrder,
    byVisibility,
    byYear,
    byYearAndType,
    byMonth,
    months,
    calendar,
    years: Object.keys(byYear).map(Number).sort((a, b) => a - b),
    byWeekday,
    byHour,

    topHosts: topEntries(hosts, 12),
    topExtensions: topEntries(extensions, 8),
    distinctHosts: Object.keys(hosts).length,

    storage: { totalBytes, byType: storageByType, largestFiles },

    words: totalWords,
    comments: { total: totalComments, blocks: blocksWithComments, mostDiscussed },
    titled,
    untitled: blocks.length - titled,
    orientation: { portrait, landscape, square },

    firstBlock: earliest
      ? { date: earliest.date.toISOString(), ...earliest.block }
      : null,
    latestBlock: latest ? { date: latest.date.toISOString(), ...latest.block } : null,

    activeDays,
    busiestDay: busiestDayKey
      ? { day: busiestDayKey, count: calendar[busiestDayKey] }
      : null,
    busiestMonth,
    streaks: streaks(dayKeys),

    pace: {
      last30,
      last90,
      last365,
      thisYear: byYear[thisYear] ?? 0,
      lastYear: byYear[thisYear - 1] ?? 0,
      lastYearToDate,
      perActiveDay: activeDays ? blocks.length / activeDays : 0,
      perWeek: (blocks.length / lifetimeDays) * 7,
      lifetimeDays,
    },
  }
}
