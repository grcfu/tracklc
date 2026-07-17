import { useMemo } from 'react'
import type { HeatmapColor, ProblemProgress } from '../data/types'
import { activityByDate } from '../lib/stats'
import { addDays, formatDate, fromISODate, todayISO } from '../lib/dates'
import { cn, heatColor, heatLevel } from '../lib/ui'

const WEEKS = 22 // ~5 months

interface HeatmapProps {
  progress: Record<string, ProblemProgress>
  /** Accent color for the filled cells. */
  color: HeatmapColor
}

/** GitHub-style contribution grid of solve/review activity, last ~5 months. */
export function Heatmap({ progress, color }: HeatmapProps) {
  const counts = useMemo(() => activityByDate(progress), [progress])

  const { weeks, monthLabels, totalDays } = useMemo(() => {
    const today = todayISO()
    const weekday = fromISODate(today).getDay() // 0=Sun
    // Fill the current week out to Saturday, then step back WEEKS*7 - 1 days.
    const end = addDays(today, 6 - weekday)
    const start = addDays(end, -(WEEKS * 7 - 1))

    const weeksArr: { date: string; count: number; future: boolean }[][] = []
    const labels: { col: number; label: string }[] = []
    let cursor = start
    let seenMonth = -1

    for (let w = 0; w < WEEKS; w++) {
      const col: { date: string; count: number; future: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const month = fromISODate(cursor).getMonth()
        if (d === 0 && month !== seenMonth) {
          labels.push({
            col: w,
            label: fromISODate(cursor).toLocaleDateString(undefined, {
              month: 'short',
            }),
          })
          seenMonth = month
        }
        col.push({
          date: cursor,
          count: counts.get(cursor) ?? 0,
          future: cursor > today,
        })
        cursor = addDays(cursor, 1)
      }
      weeksArr.push(col)
    }

    const total = [...counts.values()].reduce((a, b) => a + b, 0)
    return { weeks: weeksArr, monthLabels: labels, totalDays: total }
  }, [counts])

  return (
    <div className="mb-6 rounded-2xl border border-line bg-elevated p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-semibold">Activity</h2>
        <span className="text-xs text-muted">
          {totalDays} action{totalDays === 1 ? '' : 's'} · last 5 months
        </span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="relative mb-1 ml-0 h-3">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute text-[10px] text-muted"
                style={{ left: `${m.col * 14}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => {
                  const level = heatLevel(day.count)
                  return (
                    <div
                      key={day.date}
                      title={
                        day.future
                          ? ''
                          : `${formatDate(day.date)} — ${day.count} action${day.count === 1 ? '' : 's'}`
                      }
                      className={cn(
                        'h-[11px] w-[11px] rounded-[2px]',
                        (day.future || level === 0) && 'bg-line/40',
                        day.future && 'bg-transparent',
                      )}
                      style={
                        !day.future && level > 0
                          ? { backgroundColor: heatColor(color, level) }
                          : undefined
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn(
              'h-[11px] w-[11px] rounded-[2px]',
              level === 0 && 'bg-line/40',
            )}
            style={
              level > 0 ? { backgroundColor: heatColor(color, level) } : undefined
            }
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
