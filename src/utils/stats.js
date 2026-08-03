import { computeChannelStats } from './channelStats'
import { formatMonthYear, formatSpan } from './format'

export function computeUser(user) {
  return {
    id: user.id,
    name: user.name,
    slug: user.slug,
    avatar: user.avatar,
    initials: user.initials,
    bio: user.bio?.plain || null,
    badge: user.badge || null,
    tier: user.tier || null,
    createdAt: user.created_at,
    memberSince: formatMonthYear(user.created_at),
    accountAge: formatSpan(user.created_at),
    counts: {
      channels: user.counts?.channels ?? 0,
      followers: user.counts?.followers ?? 0,
      following: user.counts?.following ?? 0,
      notifications: user.counts?.notifications ?? 0,
    },
  }
}

export function computeStats({ user, channels, blockCount, blockStats, social }) {
  const channelStats = computeChannelStats(channels, user.slug)

  const totalBlocks = blockStats?.total ?? blockCount ?? 0
  const firstChannel = channelStats.firstChannel
    ? {
        title: channelStats.firstChannel.title,
        slug: channelStats.firstChannel.slug,
        createdAt: channelStats.firstChannel.createdAt,
        formattedDate: formatMonthYear(channelStats.firstChannel.createdAt),
      }
    : null

  return {
    user: { ...user, firstChannel },
    totalBlocks,
    totalChannels: channelStats.total,
    averageBlocksPerChannel:
      channelStats.total > 0 ? Math.round(totalBlocks / channelStats.total) : 0,
    followerCount: user.counts.followers,
    followingCount: user.counts.following,
    channels: channelStats,
    blocks: blockStats,
    social,
  }
}
