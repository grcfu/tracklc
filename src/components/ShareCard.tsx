import type { ProblemProgress } from '../data/types'
import { TOTAL_PROBLEMS } from '../data/catalog'
import { currentStreak, solvedByDifficulty, totalSolved } from '../lib/stats'
import { formatDate } from '../lib/dates'
import { DIFFICULTY_COLOR, DIFFICULTY_ORDER, pct } from '../lib/ui'
import { Logo } from './Logo'

interface ShareCardProps {
  progress: Record<string, ProblemProgress>
  /** Date the snapshot represents. */
  date: string
}

/** A compact, screenshot-friendly summary of progress — used in share + snapshot views. */
export function ShareCard({ progress, date }: ShareCardProps) {
  const solved = totalSolved(progress)
  const byDiff = solvedByDifficulty(progress)
  const streak = currentStreak(progress)
  const percent = pct(solved, TOTAL_PROBLEMS)

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface to-elevated p-5">
      <div className="flex items-center justify-between">
        <Logo className="text-2xl" />
        <span className="text-xs text-muted">{formatDate(date)}</span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold text-google-blue">
          {solved}
        </span>
        <span className="text-sm text-muted">
          / {TOTAL_PROBLEMS} problems solved · {percent}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {DIFFICULTY_ORDER.map((d) => (
          <div
            key={d}
            className="rounded-xl border border-line bg-elevated px-3 py-2 text-center"
          >
            <div
              className="font-display text-xl font-semibold"
              style={{ color: DIFFICULTY_COLOR[d] }}
            >
              {byDiff[d]}
            </div>
            <div className="text-xs text-muted">{d}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted">
        {streak > 0 ? (
          <>
            🔥 <span className="font-medium text-ink">{streak}-day</span> streak
          </>
        ) : (
          'Practicing with spaced repetition on LeetTrack.'
        )}
      </p>
    </div>
  )
}
