const SIZE_BUCKETS = ['0', '1–10', '11–50', '51–100', '101+']

function bucketFor(count) {
  if (count === 0) return '0'
  if (count <= 10) return '1–10'
  if (count <= 50) return '11–50'
  if (count <= 100) return '51–100'
  return '101+'
}

export function computeChannelStats(channels, userSlug) {
  const byVisibility = { public: 0, closed: 0, private: 0 }
  const byYear = {}
  const byBlockSize = Object.fromEntries(SIZE_BUCKETS.map((b) => [b, 0]))
  const collaboratorTally = new Map()

  const owned = []
  const collaborating = []

  let totalContents = 0
  let emptyChannels = 0
  let nestedChannels = 0
  let subChannelLinks = 0
  let collaborative = 0
  let groupOwned = 0

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  let idle6 = 0
  let idle12 = 0

  for (const channel of channels) {
    const isOwner = channel.owner?.type === 'User' && channel.owner?.slug === userSlug
    if (isOwner) owned.push(channel)
    else collaborating.push(channel)
    if (channel.owner?.type === 'Group') groupOwned++

    if (channel.visibility in byVisibility) byVisibility[channel.visibility]++

    if (channel.createdAt) {
      const year = new Date(channel.createdAt).getFullYear()
      if (!Number.isNaN(year)) byYear[year] = (byYear[year] || 0) + 1
    }

    const contents = channel.counts?.contents ?? 0
    totalContents += contents
    byBlockSize[bucketFor(contents)]++
    if (contents === 0) emptyChannels++

    if ((channel.counts?.channels ?? 0) > 0) {
      nestedChannels++
      subChannelLinks += channel.counts.channels
    }

    if ((channel.counts?.collaborators ?? 0) > 0) collaborative++

    for (const person of channel.collaborators ?? []) {
      if (person.slug === userSlug) continue
      const existing = collaboratorTally.get(person.slug)
      if (existing) existing.count++
      else collaboratorTally.set(person.slug, { ...person, count: 1 })
    }

    if (channel.updatedAt) {
      const updated = new Date(channel.updatedAt)
      if (updated < oneYearAgo) idle12++
      if (updated < sixMonthsAgo) idle6++
    }
  }

  const withCreatedAt = channels.filter((ch) => ch.createdAt)
  const sortedByCreation = [...withCreatedAt].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  )

  const longestRunning = [...channels]
    .filter((ch) => ch.createdAt && ch.updatedAt)
    .map((ch) => ({
      ...ch,
      lifespanDays: Math.max(
        0,
        Math.round((new Date(ch.updatedAt) - new Date(ch.createdAt)) / 86_400_000),
      ),
    }))
    .sort((a, b) => b.lifespanDays - a.lifespanDays)
    .slice(0, 5)

  return {
    total: channels.length,
    owned: owned.length,
    collaborating: collaborating.length,
    groupOwned,
    byVisibility,
    byYear,
    byBlockSize,
    idle: { over6Months: idle6, over1Year: idle12 },
    emptyChannels,
    nestedChannels,
    subChannelLinks,
    collaborative,
    totalContents,
    averageContents: channels.length ? Math.round(totalContents / channels.length) : 0,
    medianContents: median(channels.map((ch) => ch.counts?.contents ?? 0)),
    topBySize: [...channels]
      .sort((a, b) => (b.counts?.contents ?? 0) - (a.counts?.contents ?? 0))
      .slice(0, 5),
    recentlyUpdated: [...channels]
      .filter((ch) => ch.updatedAt)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5),
    longestRunning,
    topCollaborators: [...collaboratorTally.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    distinctCollaborators: collaboratorTally.size,
    firstChannel: sortedByCreation[0] ?? null,
    newestChannel: sortedByCreation[sortedByCreation.length - 1] ?? null,
  }
}

function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}
