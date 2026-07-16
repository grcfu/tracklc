// ── Core problem + list types ─────────────────────────────────────────────

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Problem {
  /** LeetCode slug — stable id, shared across every list so progress syncs. */
  id: string
  name: string
  category: string
  difficulty: Difficulty
  /** Canonical leetcode.com URL. */
  link: string
}

/** The three top-level tabs. */
export type ListId = 'blind75' | 'neetcode150' | 'company'

export type CompanyId =
  | 'google'
  | 'meta'
  | 'amazon'
  | 'microsoft'
  | 'apple'
  | 'netflix'

/** How commonly a problem is reported for a given company. */
export type Frequency = 'high' | 'medium' | 'low'

/** A company list references problems by id and layers on a frequency tier. */
export interface CompanyEntry {
  id: string
  frequency: Frequency
}

/** Build a canonical LeetCode problem URL from a slug. */
export const lc = (slug: string): string =>
  `https://leetcode.com/problems/${slug}/`

/**
 * Compact constructor for problem lists. `category` is per-list, since the
 * Blind 75 and NeetCode 150 group the same problem differently.
 */
export const p = (
  id: string,
  name: string,
  category: string,
  difficulty: Difficulty,
): Problem => ({ id, name, category, difficulty, link: lc(id) })
