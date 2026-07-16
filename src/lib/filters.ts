import type { Difficulty, Problem, ProblemProgress } from '../data/types'
import { isDue, isSolved, overdueDays } from './review'

export type StatusFilter = 'all' | 'solved' | 'unsolved' | 'review'
export type SortKey =
  | 'default'
  | 'difficulty'
  | 'confidence'
  | 'recent'
  | 'overdue'

export interface FilterState {
  query: string
  difficulties: Difficulty[] // empty = all
  status: StatusFilter
  sort: SortKey
}

export const DEFAULT_FILTERS: FilterState = {
  query: '',
  difficulties: [],
  status: 'all',
  sort: 'default',
}

/** True when any filter (not sort) narrows the list. */
export function isFiltering(f: FilterState): boolean {
  return (
    f.query.trim() !== '' || f.difficulties.length > 0 || f.status !== 'all'
  )
}

export function matchesFilters(
  problem: Problem,
  progress: ProblemProgress | undefined,
  f: FilterState,
): boolean {
  if (f.difficulties.length && !f.difficulties.includes(problem.difficulty)) {
    return false
  }
  const q = f.query.trim().toLowerCase()
  if (q && !problem.name.toLowerCase().includes(q)) return false

  const solved = isSolved(progress)
  if (f.status === 'solved' && !solved) return false
  if (f.status === 'unsolved' && solved) return false
  if (f.status === 'review' && !isDue(progress)) return false
  return true
}

const DIFF_RANK: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 }

/** Sort a copy of `problems` by the chosen key (no-op for 'default'). */
export function sortProblems(
  problems: Problem[],
  progress: Record<string, ProblemProgress>,
  sort: SortKey,
): Problem[] {
  if (sort === 'default') return problems
  const arr = [...problems]
  switch (sort) {
    case 'difficulty':
      arr.sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty])
      break
    case 'confidence':
      // Weakest solved first; unsolved sink to the bottom.
      arr.sort(
        (a, b) =>
          (progress[a.id]?.confidence ?? Infinity) -
          (progress[b.id]?.confidence ?? Infinity),
      )
      break
    case 'recent':
      arr.sort((a, b) =>
        (progress[b.id]?.dateSolved ?? '').localeCompare(
          progress[a.id]?.dateSolved ?? '',
        ),
      )
      break
    case 'overdue':
      arr.sort((a, b) => overdueDays(progress[b.id]) - overdueDays(progress[a.id]))
      break
  }
  return arr
}
