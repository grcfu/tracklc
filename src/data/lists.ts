import { BLIND75 } from './blind75'
import { NEETCODE150 } from './neetcode150'
import { COMPANIES } from './companies'
import { getProblem } from './catalog'
import type { CompanyId, Frequency, ListId, Problem } from './types'

/** A company problem = catalog problem + its frequency tier for that company. */
export interface CompanyProblem {
  problem: Problem
  frequency: Frequency
}

/** Resolve a company's entries against the catalog (dropping any unknown ids). */
export function companyProblems(company: CompanyId): CompanyProblem[] {
  return COMPANIES[company].flatMap((entry) => {
    const problem = getProblem(entry.id)
    return problem ? [{ problem, frequency: entry.frequency }] : []
  })
}

/** The ordered problem list backing a given tab. */
export function listProblems(list: ListId, company: CompanyId): Problem[] {
  if (list === 'blind75') return BLIND75
  if (list === 'neetcode150') return NEETCODE150
  return companyProblems(company).map((cp) => cp.problem)
}

export const LIST_LABELS: Record<Exclude<ListId, 'company'>, string> = {
  blind75: 'Blind 75',
  neetcode150: 'NeetCode 150',
}

export interface Group<T> {
  key: string
  problems: T[]
}

const FREQUENCY_TIERS: { key: string; freq: Frequency }[] = [
  { key: 'High frequency', freq: 'high' },
  { key: 'Medium frequency', freq: 'medium' },
  { key: 'Low frequency', freq: 'low' },
]

/** Group a company's problems into High / Medium / Low tiers (non-empty only). */
export function groupByFrequency(cps: CompanyProblem[]): Group<Problem>[] {
  return FREQUENCY_TIERS.map((tier) => ({
    key: tier.key,
    problems: cps.filter((c) => c.frequency === tier.freq).map((c) => c.problem),
  })).filter((g) => g.problems.length > 0)
}

/** Group problems by category, preserving first-seen order of both. */
export function groupByCategory(problems: Problem[]): Group<Problem>[] {
  const order: string[] = []
  const map = new Map<string, Problem[]>()
  for (const problem of problems) {
    if (!map.has(problem.category)) {
      map.set(problem.category, [])
      order.push(problem.category)
    }
    map.get(problem.category)!.push(problem)
  }
  return order.map((key) => ({ key, problems: map.get(key)! }))
}
