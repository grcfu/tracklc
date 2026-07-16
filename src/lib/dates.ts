// Small date helpers. All "dates" in the app are local YYYY-MM-DD strings so
// they compare cleanly and don't drift across timezones.

/** Today as a local YYYY-MM-DD string. */
export function todayISO(): string {
  return toISODate(new Date())
}

/** Format a Date as a local YYYY-MM-DD string. */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse a YYYY-MM-DD string into a local Date (midnight). */
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Whole days between two YYYY-MM-DD dates (b - a). Negative if b is before a. */
export function daysBetween(a: string, b: string): number {
  const ms = fromISODate(b).getTime() - fromISODate(a).getTime()
  return Math.round(ms / 86_400_000)
}

/** Days elapsed from a YYYY-MM-DD date until today (>= 0 for past dates). */
export function daysSince(dateISO: string): number {
  return daysBetween(dateISO, todayISO())
}

/** Add `n` days to a YYYY-MM-DD string, returning a new YYYY-MM-DD string. */
export function addDays(dateISO: string, n: number): string {
  const d = fromISODate(dateISO)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

/** Human-friendly date, e.g. "Jul 15, 2026". */
export function formatDate(dateISO: string): string {
  return fromISODate(dateISO).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Relative phrasing like "today", "yesterday", "3 days ago". */
export function relativeDays(dateISO: string): string {
  const n = daysSince(dateISO)
  if (n <= 0) return 'today'
  if (n === 1) return 'yesterday'
  if (n < 7) return `${n} days ago`
  if (n < 14) return 'last week'
  if (n < 30) return `${Math.floor(n / 7)} weeks ago`
  if (n < 60) return 'last month'
  return `${Math.floor(n / 30)} months ago`
}
