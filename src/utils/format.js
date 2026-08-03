export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** `YYYY-MM-DD` means a local calendar day, not UTC midnight. */
export function parseDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(value)
}

export function formatMonthYear(dateStr) {
  if (!dateStr) return null
  const d = parseDate(dateStr)
  if (Number.isNaN(d.getTime())) return null
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDay(dateStr) {
  if (!dateStr) return null
  const d = parseDate(dateStr)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export function formatSpan(fromStr, toStr = new Date()) {
  const from = new Date(fromStr)
  const to = toStr instanceof Date ? toStr : new Date(toStr)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null

  let years = to.getFullYear() - from.getFullYear()
  let months = to.getMonth() - from.getMonth()
  if (to.getDate() < from.getDate()) months--
  if (months < 0) {
    years--
    months += 12
  }
  if (years > 0 && months > 0) return `${years} yr ${months} mo`
  if (years > 0) return `${years} yr`
  if (months > 0) return `${months} mo`
  const days = Math.max(0, Math.round((to - from) / 86_400_000))
  return `${days} day${days === 1 ? '' : 's'}`
}

export function formatRelative(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  const seconds = Math.round((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`
  // Floor the years so this agrees with formatSpan's "10 yr 9 mo" rather than
  // rounding up to 11.
  return `${Math.floor(months / 12)}y ago`
}

export function formatBytes(bytes) {
  if (!bytes || bytes < 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / 1024 ** i
  return `${value >= 100 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

export function formatCompact(value) {
  if (value == null) return '0'
  if (Math.abs(value) < 10_000) return value.toLocaleString()
  if (Math.abs(value) < 1_000_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
}

export function pluralise(count, singular, plural = `${singular}s`) {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`
}

/** Local-time YYYY-MM-DD key, so calendar buckets match the user's own days. */
export function dayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
