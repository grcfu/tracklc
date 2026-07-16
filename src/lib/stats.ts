import type { Difficulty, ProblemProgress } from '../data/types'
import { getProblem } from '../data/catalog'
import { addDays, todayISO } from './dates'
import { isSolved } from './review'

type ProgressMap = Record<string, ProblemProgress>

/** Count of solved problems per difficulty (looked up from the catalog). */
export function solvedByDifficulty(
  progress: ProgressMap,
): Record<Difficulty, number> {
  const counts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 }
  for (const [id, p] of Object.entries(progress)) {
    if (!isSolved(p)) continue
    const diff = getProblem(id)?.difficulty
    if (diff) counts[diff]++
  }
  return counts
}

export function totalSolved(progress: ProgressMap): number {
  return Object.values(progress).filter(isSolved).length
}

/** Every date on which there was activity (a solve or a review). */
export function activeDates(progress: ProgressMap): Set<string> {
  const dates = new Set<string>()
  for (const p of Object.values(progress)) {
    if (p.dateSolved) dates.add(p.dateSolved)
    if (p.lastReviewed) dates.add(p.lastReviewed)
    for (const h of p.confidenceHistory ?? []) dates.add(h.date)
  }
  return dates
}

/**
 * Consecutive days with ≥1 activity, ending today. Yesterday counts as the
 * anchor if there's nothing yet today, so the streak doesn't visually reset
 * before the day is over.
 */
export function currentStreak(progress: ProgressMap): number {
  const dates = activeDates(progress)
  if (dates.size === 0) return 0

  let cursor = todayISO()
  if (!dates.has(cursor)) {
    cursor = addDays(cursor, -1)
    if (!dates.has(cursor)) return 0
  }
  let streak = 0
  while (dates.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** Distinct problems solved or reviewed today (feeds the daily-goal ring). */
export function problemsToday(progress: ProgressMap): number {
  const today = todayISO()
  let n = 0
  for (const p of Object.values(progress)) {
    if (p.dateSolved === today || p.lastReviewed === today) n++
  }
  return n
}

export interface WeakestCategory {
  category: string
  avg: number
  count: number
}

/** Lowest average-confidence category among those with ≥ minSolved solved. */
export function weakestCategory(
  progress: ProgressMap,
  minSolved = 3,
): WeakestCategory | null {
  const acc = new Map<string, { sum: number; count: number }>()
  for (const [id, p] of Object.entries(progress)) {
    if (!isSolved(p) || !p.confidence) continue
    const cat = getProblem(id)?.category
    if (!cat) continue
    const cur = acc.get(cat) ?? { sum: 0, count: 0 }
    cur.sum += p.confidence
    cur.count += 1
    acc.set(cat, cur)
  }

  let worst: WeakestCategory | null = null
  for (const [category, { sum, count }] of acc) {
    if (count < minSolved) continue
    const avg = sum / count
    if (!worst || avg < worst.avg) worst = { category, avg, count }
  }
  return worst
}

/** Per-day activity counts (solve + review events) for the heatmap. */
export function activityByDate(progress: ProgressMap): Map<string, number> {
  const counts = new Map<string, number>()
  const bump = (d?: string) => {
    if (!d) return
    counts.set(d, (counts.get(d) ?? 0) + 1)
  }
  for (const p of Object.values(progress)) {
    bump(p.dateSolved)
    if (p.lastReviewed && p.lastReviewed !== p.dateSolved) bump(p.lastReviewed)
  }
  return counts
}
