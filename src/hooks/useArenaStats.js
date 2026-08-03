import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AbortedError,
  fetchAllBlocks,
  fetchAllChannels,
  fetchBlockCount,
  fetchFeed,
  fetchFollowingBreakdown,
  fetchGroups,
  fetchRecentFollowers,
  fetchMe,
  setTier,
} from '../api/arena'
import { clearCache, readCache, writeCache } from '../api/cache'
import { computeBlockStats } from '../utils/blockStats'
import { computeStats, computeUser } from '../utils/stats'

const REPUBLISH_EVERY_PAGES = 5

export function useArenaStats(token) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)
  const [cachedAt, setCachedAt] = useState(null)
  const [nonce, setNonce] = useState(0)

  const userIdRef = useRef(null)

  const refresh = useCallback(() => {
    clearCache(userIdRef.current)
    setNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const { signal } = controller
    let cancelled = false

    setLoading(true)
    setError(null)
    setProgress({ stage: 'account' })

    async function load() {
      // 1. Identity — also tells us the rate-limit budget we get to work with.
      const me = await fetchMe(token, signal)
      setTier(me.tier)
      const user = computeUser(me)
      userIdRef.current = user.id

      let channels = []
      let blockCount = 0
      let blockStats = null
      let social = null
      let oldestCache = null

      const publish = () => {
        if (cancelled) return
        setStats(computeStats({ user, channels, blockCount, blockStats, social }))
      }

      // 2. Channels — cheap enough to always be first paint.
      const channelCache = readCache('channels', user.id)
      if (channelCache) {
        channels = channelCache.data
        oldestCache = channelCache.savedAt
      } else {
        setProgress({ stage: 'channels' })
        const result = await fetchAllChannels(user.slug, token, {
          signal,
          onPage: (_items, page, totalPages) => {
            if (!cancelled) setProgress({ stage: 'channels', page, totalPages })
          },
        })
        channels = result.items
        writeCache('channels', user.id, channels)
      }
      publish()
      if (cancelled) return

      // 3. Blocks — the expensive one. Stream it in so the page fills as it goes.
      const blockCache = readCache('blocks', user.id)
      if (blockCache) {
        blockCount = blockCache.data.totalCount
        blockStats = computeBlockStats(blockCache.data.blocks, {
          totalCount: blockCache.data.totalCount,
          truncated: blockCache.data.truncated,
        })
        oldestCache = Math.min(oldestCache ?? blockCache.savedAt, blockCache.savedAt)
        publish()
      } else {
        blockCount = await fetchBlockCount(user.slug, token, signal)
        publish()

        const collected = []
        const result = await fetchAllBlocks(user.slug, token, {
          signal,
          onPage: (items, page, totalPages, totalCount) => {
            if (cancelled) return
            collected.push(...items)
            setProgress({
              stage: 'blocks',
              page,
              totalPages,
              loaded: collected.length,
              total: totalCount,
            })
            if (page % REPUBLISH_EVERY_PAGES === 0 && page !== totalPages) {
              blockStats = computeBlockStats(collected, {
                totalCount,
                complete: false,
              })
              publish()
            }
          },
        })

        blockCount = result.totalCount
        blockStats = computeBlockStats(result.items, {
          totalCount: result.totalCount,
          truncated: result.truncated,
        })
        writeCache('blocks', user.id, {
          blocks: result.items,
          totalCount: result.totalCount,
          truncated: result.truncated,
        })
        publish()
      }
      if (cancelled) return

      // 4. Social graph and activity — nice to have, never fatal.
      const socialCache = readCache('social', user.id)
      if (socialCache) {
        social = socialCache.data
        oldestCache = Math.min(oldestCache ?? socialCache.savedAt, socialCache.savedAt)
      } else {
        setProgress({ stage: 'social' })
        const settle = (promise) => promise.then((value) => value, () => null)
        const [following, groups, followers, feed] = await Promise.all([
          settle(fetchFollowingBreakdown(user.slug, token, signal)),
          settle(fetchGroups(user.slug, token, signal)),
          settle(fetchRecentFollowers(user.slug, token, signal)),
          settle(fetchFeed(token, signal)),
        ])
        social = { following, groups, followers, feed }
        writeCache('social', user.id, social)
      }
      publish()

      if (!cancelled) {
        setCachedAt(oldestCache)
        setProgress(null)
        setLoading(false)
      }
    }

    load().catch((err) => {
      if (cancelled || err instanceof AbortedError || err?.name === 'AbortError') return
      setError(err.message)
      setLoading(false)
      setProgress(null)
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [token, nonce])

  return { stats, loading, error, progress, cachedAt, refresh }
}
