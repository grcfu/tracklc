import type { Difficulty } from '../data/types'

/** Tiny classnames joiner. */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(' ')
}

/** Pill badge classes per difficulty — soft tinted bg, solid readable text. */
export const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  Easy: 'bg-google-green/10 text-google-green dark:bg-google-green/20',
  Medium: 'bg-google-yellow/20 text-amber-700 dark:text-google-yellow dark:bg-google-yellow/15',
  Hard: 'bg-google-red/10 text-google-red dark:bg-google-red/20',
}

/** Alternating Google colors for the wordmark, cycled per letter. */
export const LOGO_COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853']

export const DIFFICULTY_ORDER: Difficulty[] = ['Easy', 'Medium', 'Hard']

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy: '#34A853',
  Medium: '#FBBC04',
  Hard: '#EA4335',
}

/** Clamp a number into [min, max]. */
export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n))

/** Safe percentage (0 when denominator is 0). */
export const pct = (num: number, den: number): number =>
  den <= 0 ? 0 : Math.round((num / den) * 100)
