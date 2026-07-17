import type { Difficulty, HeatmapColor } from '../data/types'

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

/** The four Google brand colors as hex, keyed by name. */
export const GOOGLE_COLORS: Record<HeatmapColor, string> = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC04',
  green: '#34A853',
}

/** Opacity per heat level (0 = empty, 4 = most active). */
const HEAT_ALPHA = [0, 0.3, 0.5, 0.75, 1] as const

/** Bucket an activity count into a heat level 0–4. */
export function heatLevel(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

/** A CSS rgba() string for the given accent color at a heat level (1–4). */
export function heatColor(color: HeatmapColor, level: number): string {
  const hex = GOOGLE_COLORS[color]
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${HEAT_ALPHA[level] ?? 0})`
}

/** Clamp a number into [min, max]. */
export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n))

/** Safe percentage (0 when denominator is 0). */
export const pct = (num: number, den: number): number =>
  den <= 0 ? 0 : Math.round((num / den) * 100)
