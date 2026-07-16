import type { Problem, ProblemProgress } from '../data/types'
import { PROBLEM_CATALOG } from '../data/catalog'
import { isDue, isSolved, overdueDays } from './review'
import { weakestCategory } from './stats'
import { todayISO } from './dates'

export type SuggestionKind = 'review' | 'weak' | 'stretch'

export interface Suggestion {
  id: string
  name: string
  link: string
  difficulty: Problem['difficulty']
  reason: string
  kind: SuggestionKind
}

type ProgressMap = Record<string, ProblemProgress>

// Tiny deterministic RNG so the "stretch" pick is stable across a single day
// (Math.random would reshuffle on every render).
function seedFromString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function reviewReason(p: ProblemProgress): string {
  const c = p.confidence ?? 0
  if (c <= 2) return `You rated this ${c}★ — maybe revisit?`
  return `Due for a quick refresher`
}

/**
 * Assemble the day's gentle suggestions: overdue reviews first, then unsolved
 * problems in the weakest area, then one date-seeded "stretch" problem.
 * Deterministic for a given day + progress, so it doesn't churn on re-render.
 */
export function buildSuggestions(progress: ProgressMap, max = 6): Suggestion[] {
  const all = Object.values(PROBLEM_CATALOG)
  const out: Suggestion[] = []
  const seen = new Set<string>()

  const push = (problem: Problem, reason: string, kind: SuggestionKind) => {
    if (seen.has(problem.id)) return
    seen.add(problem.id)
    out.push({
      id: problem.id,
      name: problem.name,
      link: problem.link,
      difficulty: problem.difficulty,
      reason,
      kind,
    })
  }

  // 1) Overdue reviews, most overdue first.
  const due = all
    .filter((p) => isDue(progress[p.id]))
    .sort((a, b) => overdueDays(progress[b.id]) - overdueDays(progress[a.id]))
  for (const problem of due) push(problem, reviewReason(progress[problem.id]), 'review')

  // 2) Unsolved problems in the weakest category.
  const weak = weakestCategory(progress)
  if (weak) {
    const unsolvedInWeak = all.filter(
      (p) => p.category === weak.category && !isSolved(progress[p.id]),
    )
    for (const problem of unsolvedInWeak.slice(0, 2)) {
      push(problem, `Unsolved in ${weak.category}, your weakest area`, 'weak')
    }
  }

  // 3) One date-seeded stretch problem from anything still unsolved.
  const unsolved = all.filter((p) => !isSolved(progress[p.id]))
  if (unsolved.length) {
    const rng = mulberry32(seedFromString(todayISO()))
    const pick = unsolved[Math.floor(rng() * unsolved.length)]
    push(pick, `A fresh ${pick.difficulty} to try`, 'stretch')
  }

  return out.slice(0, max)
}
