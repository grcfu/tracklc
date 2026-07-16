import type { Confidence, ProblemProgress } from '../data/types'
import { addDays, daysSince } from './dates'

/**
 * Confidence-based spaced-repetition intervals (days until a solved problem is
 * due for review again). Lower confidence → sooner. This is the smart layer on
 * top of the simple "≤3★ or 14+ days old" rule.
 */
export const REVIEW_INTERVALS: Record<Confidence, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
}

export function isSolved(p?: ProblemProgress): boolean {
  return (p?.confidence ?? 0) > 0
}

/** The date review timing is measured from (last review, else solve date). */
export function reviewReference(p: ProblemProgress): string | null {
  return p.lastReviewed ?? p.dateSolved ?? null
}

/** When this problem next becomes due for review (null if unsolved/undated). */
export function dueDate(p: ProblemProgress): string | null {
  if (!p.confidence) return null
  const ref = reviewReference(p)
  if (!ref) return null
  return addDays(ref, REVIEW_INTERVALS[p.confidence])
}

/** Days past due; ≥0 means due now, larger = more overdue. */
export function overdueDays(p?: ProblemProgress): number {
  if (!p) return Number.NEGATIVE_INFINITY
  const d = dueDate(p)
  if (d === null) return Number.NEGATIVE_INFINITY
  return daysSince(d)
}

/** Is this solved problem due for review? */
export function isDue(p?: ProblemProgress): boolean {
  return isSolved(p) && overdueDays(p) >= 0
}
