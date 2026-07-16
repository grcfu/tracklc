import type { Confidence, Difficulty, ProblemProgress } from '../data/types'
import { getProblem } from '../data/catalog'
import { formatDayHeading } from './dates'

export interface LogEvent {
  id: string
  name: string
  link: string
  difficulty: Difficulty
  date: string
  /** Rating recorded that day; absent means a review with no rating change. */
  rating?: Confidence
}

export interface LogDay {
  date: string
  events: LogEvent[]
}

type ProgressMap = Record<string, ProblemProgress>

// YYYY-MM-DD strings compare lexicographically == chronologically.
const inRange = (d: string, from: string, to: string) => d >= from && d <= to

/**
 * All dated activity within [from, to] inclusive, grouped by day (newest first).
 * A problem's activity is collapsed to one entry per date — a rating that day
 * wins over a plain review — reconstructed from confidenceHistory, dateSolved,
 * and lastReviewed. Only what was actually tracked can appear.
 */
export function buildActivityLog(
  progress: ProgressMap,
  from: string,
  to: string,
): LogDay[] {
  const byDate = new Map<string, LogEvent[]>()

  for (const [id, p] of Object.entries(progress)) {
    const problem = getProblem(id)
    if (!problem) continue

    const perDate = new Map<string, Confidence | undefined>()
    for (const h of p.confidenceHistory ?? []) {
      if (inRange(h.date, from, to)) perDate.set(h.date, h.value)
    }
    if (p.dateSolved && inRange(p.dateSolved, from, to) && !perDate.has(p.dateSolved)) {
      perDate.set(p.dateSolved, p.confidence)
    }
    if (
      p.lastReviewed &&
      inRange(p.lastReviewed, from, to) &&
      !perDate.has(p.lastReviewed)
    ) {
      perDate.set(p.lastReviewed, undefined)
    }

    for (const [date, rating] of perDate) {
      const list = byDate.get(date) ?? []
      list.push({
        id,
        name: problem.name,
        link: problem.link,
        difficulty: problem.difficulty,
        date,
        rating,
      })
      byDate.set(date, list)
    }
  }

  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, events]) => ({
      date,
      events: events.sort((a, b) => a.name.localeCompare(b.name)),
    }))
}

/** Render a log as plain text, ready to paste into a message. */
export function formatLogText(days: LogDay[]): string {
  if (days.length === 0) return 'No problems logged in this range.'
  return days
    .map((day) => {
      const lines = day.events.map(
        (e) =>
          `  • ${e.name} (${e.difficulty}) — ${
            e.rating ? `${e.rating}★` : 'reviewed'
          }`,
      )
      return `${formatDayHeading(day.date)}\n${lines.join('\n')}`
    })
    .join('\n\n')
}

/** Total events across all days. */
export function countEvents(days: LogDay[]): number {
  return days.reduce((n, d) => n + d.events.length, 0)
}
