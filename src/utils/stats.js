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
    },
    totalChannels,
    totalBlocks: blockCount,
    channelsByVisibility,
    followerCount: user.counts?.followers || 0,
    followingCount: user.counts?.following || 0,
    topChannelsBySize,
    mostRecentChannels,
    averageBlocksPerChannel:
      totalChannels > 0 ? Math.round(blockCount / totalChannels) : 0,
  }
}
