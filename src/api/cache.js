// Fetching every block can be hundreds of requests, so we keep the trimmed
// payload in localStorage and only re-fetch on demand or when it goes stale.

const PREFIX = 'arena_cache_v1'
const MAX_AGE_MS = 1000 * 60 * 60 * 24 // 24 hours

function key(name, userId) {
  return `${PREFIX}:${name}:${userId}`
}

export function readCache(name, userId) {
  try {
    const raw = localStorage.getItem(key(name, userId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.savedAt !== 'number') return null
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function writeCache(name, userId, data) {
  try {
    localStorage.setItem(
      key(name, userId),
      JSON.stringify({ savedAt: Date.now(), data }),
    )
    return true
  } catch {
    // Quota exceeded on a very large account — the app still works, it just
    // has to re-fetch next time.
    return false
  }
}

export function clearCache(userId) {
  try {
    const doomed = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(`${PREFIX}:`) && (userId == null || k.endsWith(`:${userId}`))) {
        doomed.push(k)
      }
    }
    doomed.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}
