const BASE = import.meta.env.PROD ? 'https://api.are.na/v3' : '/api/arena/v3'

// Are.na enforces a per-minute request budget by account tier. We can't read
// the X-RateLimit-* headers in production (they aren't in the CORS expose list),
// so we self-throttle from the tier reported by /me instead.
const TIER_LIMITS = { guest: 30, free: 120, premium: 300, supporter: 600 }
const SAFETY = 0.8

let budget = Math.floor(TIER_LIMITS.guest * SAFETY)
const recentRequests = []

export function setTier(tier) {
  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free
  budget = Math.max(8, Math.floor(limit * SAFETY))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function takeSlot() {
  for (;;) {
    const now = Date.now()
    while (recentRequests.length && now - recentRequests[0] > 60_000) {
      recentRequests.shift()
    }
    if (recentRequests.length < budget) {
      recentRequests.push(now)
      return
    }
    await sleep(Math.max(100, 60_000 - (now - recentRequests[0]) + 50))
  }
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export class AbortedError extends Error {}

async function request(path, token, { signal, retries = 3 } = {}) {
  if (signal?.aborted) throw new AbortedError('aborted')
  await takeSlot()
  if (signal?.aborted) throw new AbortedError('aborted')

  const res = await fetch(`${BASE}${path}`, { headers: headers(token), signal })

  if (res.status === 429 && retries > 0) {
    const retryAfter = Number(res.headers.get('Retry-After'))
    await sleep((Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 20) * 1000)
    return request(path, token, { signal, retries: retries - 1 })
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Rate limited by Are.na. Please wait a minute and try again.')
    }
    if (res.status === 401) {
      throw new Error('Invalid token. Please check your Are.na access token.')
    }
    if (res.status === 403) {
      throw new Error('That token does not have permission for this data.')
    }
    throw new Error(`Are.na API error (${res.status})`)
  }

  return res.json()
}

/**
 * Walk every page of a paginated collection, sequentially, reporting progress.
 * `onPage(items, page, totalPages, totalCount)` fires after each page lands.
 */
async function paginate(path, token, options = {}) {
  const { per = 100, maxPages = Infinity, onPage, signal, map } = options
  const sep = path.includes('?') ? '&' : '?'

  const first = await request(`${path}${sep}per=${per}&page=1`, token, { signal })
  const totalCount = first.meta?.total_count ?? first.data?.length ?? 0
  const availablePages = first.meta?.total_pages ?? 1
  const lastPage = Math.min(availablePages, maxPages)

  const items = (first.data ?? []).map(map ?? ((x) => x))
  onPage?.(items, 1, lastPage, totalCount)

  for (let page = 2; page <= lastPage; page++) {
    const res = await request(`${path}${sep}per=${per}&page=${page}`, token, { signal })
    const mapped = (res.data ?? []).map(map ?? ((x) => x))
    items.push(...mapped)
    onPage?.(mapped, page, lastPage, totalCount)
  }

  return {
    items,
    totalCount,
    truncated: availablePages > lastPage,
    pagesFetched: lastPage,
  }
}

/** Cheapest possible way to read a collection's size: one item, read the meta. */
async function countOf(path, token, signal) {
  const sep = path.includes('?') ? '&' : '?'
  const res = await request(`${path}${sep}per=1&page=1`, token, { signal })
  return res.meta?.total_count ?? 0
}

// --- Blocks are the bulk of the payload, so keep only what the stats need. ---

function hostOf(url) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function wordCount(text) {
  if (!text) return 0
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function trimBlock(block) {
  const isAttachment = block.type === 'Attachment'
  const size = isAttachment
    ? block.attachment?.file_size ?? 0
    : block.image?.file_size ?? 0

  return {
    id: block.id,
    type: block.type,
    createdAt: block.created_at,
    updatedAt: block.updated_at,
    title: block.title || null,
    slug: block.slug || null,
    visibility: block.visibility || null,
    comments: block.comment_count || 0,
    host: hostOf(block.source?.url),
    url: block.source?.url || null,
    size,
    ext: block.attachment?.file_extension || null,
    aspect: block.image?.aspect_ratio ?? null,
    words: block.type === 'Text' ? wordCount(block.content?.plain) : 0,
  }
}

function trimChannel(channel) {
  return {
    id: channel.id,
    title: channel.title,
    slug: channel.slug,
    createdAt: channel.created_at,
    updatedAt: channel.updated_at,
    visibility: channel.visibility,
    owner: channel.owner
      ? {
          id: channel.owner.id,
          type: channel.owner.type,
          name: channel.owner.name,
          slug: channel.owner.slug,
        }
      : null,
    counts: {
      blocks: channel.counts?.blocks ?? 0,
      channels: channel.counts?.channels ?? 0,
      contents: channel.counts?.contents ?? 0,
      collaborators: channel.counts?.collaborators ?? 0,
    },
    collaborators: (channel.collaborators ?? []).map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      slug: c.slug,
      avatar: c.avatar || null,
    })),
  }
}

function trimUser(user) {
  return {
    id: user.id,
    name: user.name,
    slug: user.slug,
    avatar: user.avatar || null,
    initials: user.initials || null,
  }
}

// --- Endpoints -------------------------------------------------------------

export function fetchMe(token, signal) {
  return request('/me', token, { signal })
}

export function fetchAllChannels(userSlug, token, options = {}) {
  return paginate(`/users/${userSlug}/contents?type=Channel&sort=created_at_desc`, token, {
    ...options,
    map: trimChannel,
  })
}

export function fetchAllBlocks(userSlug, token, options = {}) {
  return paginate(`/users/${userSlug}/contents?type=Block&sort=created_at_desc`, token, {
    maxPages: 250,
    ...options,
    map: trimBlock,
  })
}

export function fetchBlockCount(userSlug, token, signal) {
  return countOf(`/users/${userSlug}/contents?type=Block`, token, signal)
}

export async function fetchFollowingBreakdown(userSlug, token, signal) {
  const [users, channels, groups] = await Promise.all([
    countOf(`/users/${userSlug}/following?type=User`, token, signal),
    countOf(`/users/${userSlug}/following?type=Channel`, token, signal),
    countOf(`/users/${userSlug}/following?type=Group`, token, signal),
  ])
  return { users, channels, groups }
}

export async function fetchRecentFollowers(userSlug, token, signal) {
  const res = await request(`/users/${userSlug}/followers?per=12&page=1`, token, { signal })
  return {
    total: res.meta?.total_count ?? 0,
    users: (res.data ?? []).map(trimUser),
  }
}

export async function fetchGroups(userSlug, token, signal) {
  const res = await request(`/users/${userSlug}/groups?per=100&page=1`, token, { signal })
  return (res.data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    avatar: g.avatar || null,
    createdAt: g.created_at,
    owner: g.user ? trimUser(g.user) : null,
  }))
}

