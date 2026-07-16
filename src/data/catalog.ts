import type { Problem } from './types'
import { BLIND75 } from './blind75'

/**
 * The merged problem catalog: a single source of truth for problem metadata
 * (name, difficulty, link) keyed by id. Built by folding every list together
 * and de-duping by id so the same problem — appearing in multiple lists —
 * resolves to one canonical entry. This is what lets progress sync across
 * lists: everything is keyed by the shared id.
 *
 * More sources (NeetCode 150, company-only extras) are merged in as they land.
 */
const SOURCES: Problem[][] = [BLIND75]

function buildCatalog(sources: Problem[][]): Record<string, Problem> {
  const catalog: Record<string, Problem> = {}
  for (const list of sources) {
    for (const problem of list) {
      // First definition wins — later lists only fill in problems not yet seen.
      if (!catalog[problem.id]) catalog[problem.id] = problem
    }
  }
  return catalog
}

export const PROBLEM_CATALOG: Record<string, Problem> = buildCatalog(SOURCES)

/** Look up canonical problem metadata by id (undefined if unknown). */
export const getProblem = (id: string): Problem | undefined =>
  PROBLEM_CATALOG[id]

/** Total number of distinct problems known across all lists. */
export const TOTAL_PROBLEMS = Object.keys(PROBLEM_CATALOG).length
