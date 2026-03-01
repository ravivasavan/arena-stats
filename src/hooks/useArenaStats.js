import { useState, useEffect } from 'react'
import { fetchMe, fetchAllChannels, fetchBlockCount } from '../api/arena'
import { computeStats } from '../utils/stats'

export function useArenaStats(token) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const user = await fetchMe(token)
        const [channels, blockCount] = await Promise.all([
          fetchAllChannels(user.slug, token),
          fetchBlockCount(user.slug, token),
        ])

        if (!cancelled) {
          setStats(computeStats(user, channels, blockCount))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [token])

  return { stats, loading, error }
}
