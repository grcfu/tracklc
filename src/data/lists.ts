import { BLIND75 } from './blind75'
import { NEETCODE150 } from './neetcode150'
import { NEETCODE_ALL } from './neetcodeAll'
import { LEETCODE_ALL } from './leetcodeAll'
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
  if (list === 'neetcodeAll') return NEETCODE_ALL
  if (list === 'leetcodeAll') return LEETCODE_ALL
  return companyProblems(company).map((cp) => cp.problem)
}

export const LIST_LABELS: Record<Exclude<ListId, 'company'>, string> = {
  blind75: 'Blind 75',
  neetcode150: 'NeetCode 150',
  neetcodeAll: 'NeetCode All',
  leetcodeAll: 'LeetCode All',
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

/** LeetCode All problems per section — sections start collapsed, so keep them small. */
const RANGE_SIZE = 100

/** Section key for a LeetCode All problem, from the number in its name. */
function rangeKey(problem: Problem): string {
  const num = parseInt(problem.name, 10)
  const start = Math.floor((num - 1) / RANGE_SIZE) * RANGE_SIZE + 1
  return `#${start}–${start + RANGE_SIZE - 1}`
}

/** Group LeetCode All problems into numbered ranges (#1–100, #101–200, …). */
export function groupByNumberRange(problems: Problem[]): Group<Problem>[] {
  const groups: Group<Problem>[] = []
  for (const problem of problems) {
    const key = rangeKey(problem)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.problems.push(problem)
    else groups.push({ key, problems: [problem] })
  }
  return groups
}

/** Every LeetCode All section key, used to start them all collapsed. */
export const LEETCODE_ALL_SECTIONS: string[] = groupByNumberRange(LEETCODE_ALL).map((g) => g.key)
