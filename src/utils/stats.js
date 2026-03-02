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

  return {
    user: {
      name: user.name,
      avatar: user.avatar,
      slug: user.slug,
      createdAt: user.created_at,
      memberSince: formatMemberSince(user.created_at),
      accountAge: formatAccountAge(user.created_at),
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
  }
}
