const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatMemberSince(dateStr) {
  const d = new Date(dateStr)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

function formatAccountAge(dateStr) {
  const created = new Date(dateStr)
  const now = new Date()
  let years = now.getFullYear() - created.getFullYear()
  let months = now.getMonth() - created.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  if (years > 0 && months > 0) return `${years} yr ${months} mo`
  if (years > 0) return `${years} yr`
  return `${months} mo`
}

function groupChannelsByYear(channels) {
  const byYear = {}
  for (const ch of channels) {
    if (!ch.created_at) continue
    const year = new Date(ch.created_at).getFullYear()
    byYear[year] = (byYear[year] || 0) + 1
  }
  return byYear
}

export function computeStats(user, channels, blockCount) {
  const totalChannels = channels.length

  const channelsByVisibility = { public: 0, closed: 0, private: 0 }
  for (const ch of channels) {
    const vis = ch.visibility
    if (vis in channelsByVisibility) {
      channelsByVisibility[vis]++
    }
  }

  const topChannelsBySize = [...channels]
    .sort((a, b) => (b.counts?.contents || 0) - (a.counts?.contents || 0))
    .slice(0, 5)

  const mostRecentChannels = [...channels]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)

  const withCreatedAt = channels.filter((ch) => ch.created_at)
  const firstChannelRaw =
    withCreatedAt.length === 0
      ? null
      : withCreatedAt.reduce((earliest, ch) =>
          new Date(ch.created_at) < new Date(earliest.created_at) ? ch : earliest
        )
  const firstChannel =
    firstChannelRaw === null
      ? null
      : {
          title: firstChannelRaw.title,
          slug: firstChannelRaw.slug,
          created_at: firstChannelRaw.created_at,
          formattedDate: formatMemberSince(firstChannelRaw.created_at),
        }

  const buckets = { '0': 0, '1–10': 0, '11–50': 0, '51–100': 0, '101+': 0 }
  for (const ch of channels) {
    const count = ch.counts?.contents ?? 0
    if (count === 0) buckets['0']++
    else if (count <= 10) buckets['1–10']++
    else if (count <= 50) buckets['11–50']++
    else if (count <= 100) buckets['51–100']++
    else buckets['101+']++
  }
  const channelsByBlockSize = { ...buckets }

  const now = new Date()
  const sixMonthsMs = 6 * 30 * 24 * 60 * 60 * 1000
  const oneYearMs = 12 * 30 * 24 * 60 * 60 * 1000
  const sixMonthsAgo = new Date(now.getTime() - sixMonthsMs)
  const oneYearAgo = new Date(now.getTime() - oneYearMs)
  let over6Months = 0
  let over1Year = 0
  for (const ch of channels) {
    if (ch.updated_at) {
      const updated = new Date(ch.updated_at)
      if (updated < oneYearAgo) over1Year++
      if (updated < sixMonthsAgo) over6Months++
    }
  }
  const idleChannels = { over6Months, over1Year }

  return {
    user: {
      name: user.name,
      avatar: user.avatar,
      slug: user.slug,
      createdAt: user.created_at,
      memberSince: formatMemberSince(user.created_at),
      accountAge: formatAccountAge(user.created_at),
      firstChannel,
    },
    totalChannels,
    totalBlocks: blockCount,
    channelsByVisibility,
    channelsByYear: groupChannelsByYear(channels),
    followerCount: user.counts?.followers || 0,
    followingCount: user.counts?.following || 0,
    topChannelsBySize,
    mostRecentChannels,
    averageBlocksPerChannel:
      totalChannels > 0 ? Math.round(blockCount / totalChannels) : 0,
    firstChannel,
    channelsByBlockSize,
    idleChannels,
  }
}
