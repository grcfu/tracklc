import { useMemo } from 'react'
import { Flame, Target, TrendingDown } from 'lucide-react'
import type { ProblemProgress } from '../data/types'
import { DIFFICULTY_COLOR } from '../lib/ui'
import {
  currentStreak,
  problemsToday,
  solvedByDifficulty,
  totalSolved,
  weakestCategory,
} from '../lib/stats'

interface StatsRowProps {
  progress: Record<string, ProblemProgress>
  dailyGoal: number
  /** 'grid' = responsive 2/4-up row (default); 'stack' = single column for a sidebar. */
  layout?: 'grid' | 'stack'
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-elevated p-4 shadow-sm">
      {children}
    </div>
  )
}

/** GitHub-style small dashboard: difficulty counts, streak, weakest area, goal. */
export function StatsRow({ progress, dailyGoal, layout = 'grid' }: StatsRowProps) {
  const byDiff = useMemo(() => solvedByDifficulty(progress), [progress])
  const total = useMemo(() => totalSolved(progress), [progress])
  const streak = useMemo(() => currentStreak(progress), [progress])
  const weakest = useMemo(() => weakestCategory(progress), [progress])
  const today = useMemo(() => problemsToday(progress), [progress])

  const goalPct = Math.min(1, dailyGoal > 0 ? today / dailyGoal : 0)

  const containerCls =
    layout === 'stack'
      ? 'grid grid-cols-1 gap-3'
      : 'mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4'

  return (
    <div className={containerCls}>
      {/* Solved by difficulty */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Solved
        </p>
        <p className="mt-1 font-display text-2xl font-bold tabular-nums">
          {total}
        </p>
        <div className="mt-2 flex gap-3 text-xs font-medium">
          {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
            <span key={d} className="tabular-nums" style={{ color: DIFFICULTY_COLOR[d] }}>
              {byDiff[d]} <span className="text-muted">{d[0]}</span>
            </span>
          ))}
        </div>
      </Card>

      {/* Streak */}
      <Card>
        <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
          <Flame size={13} className="text-google-red" /> Streak
        </p>
        <p className="mt-1 font-display text-2xl font-bold tabular-nums">
          {streak}
          <span className="ml-1 text-sm font-medium text-muted">
            day{streak === 1 ? '' : 's'}
          </span>
        </p>
        <p className="mt-2 text-xs text-muted">
          {streak > 0 ? 'Keep it going!' : 'Solve one to start a streak.'}
        </p>
      </Card>

      {/* Weakest category */}
      <Card>
        <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
          <TrendingDown size={13} className="text-google-yellow" /> Weakest area
        </p>
        {weakest ? (
          <>
            <p
              className="mt-1 truncate font-display text-base font-bold"
              title={weakest.category}
            >
              {weakest.category}
            </p>
            <p className="mt-2 text-xs text-muted">
              avg {weakest.avg.toFixed(1)}★ over {weakest.count} solved
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted">
            Solve 3+ in a category to see this.
          </p>
        )}
      </Card>

      {/* Daily goal ring */}
      <Card>
        <div className="flex items-center gap-3">
          <GoalRing pct={goalPct} />
          <div>
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
              <Target size={13} className="text-google-blue" /> Today
            </p>
            <p className="mt-1 font-display text-lg font-bold tabular-nums">
              {today}
              <span className="text-sm font-medium text-muted"> / {dailyGoal}</span>
            </p>
            <p className="text-xs text-muted">
              {today >= dailyGoal ? 'Goal met 🎉' : 'daily goal'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function GoalRing({ pct }: { pct: number }) {
  const r = 20
  const c = 2 * Math.PI * r
  const done = pct >= 1
  return (
    <svg width={52} height={52} viewBox="0 0 52 52" className="shrink-0" aria-hidden>
      <circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke="rgb(var(--line))"
        strokeWidth={5}
      />
      <circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke={done ? '#34A853' : '#4285F4'}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 26 26)"
        style={{ transition: 'stroke-dashoffset 500ms ease-out' }}
      />
    </svg>
  )
}
