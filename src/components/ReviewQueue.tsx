import { useMemo, useState } from 'react'
import { CalendarClock, Check, ChevronDown, ExternalLink } from 'lucide-react'
import type { Confidence, ProblemProgress } from '../data/types'
import { PROBLEM_CATALOG } from '../data/catalog'
import { dueDate, isDue, overdueDays } from '../lib/review'
import { relativeDays } from '../lib/dates'
import { cn, DIFFICULTY_BADGE } from '../lib/ui'
import { StarRating } from './StarRating'

interface ReviewQueueProps {
  progress: Record<string, ProblemProgress>
  onReview: (id: string, confidence?: Confidence) => void
}

const MAX_VISIBLE = 20

/**
 * The spaced-repetition core: everything due for review, most overdue first.
 * Re-rating a problem here (or hitting "Reviewed") bumps its review date.
 */
export function ReviewQueue({ progress, onReview }: ReviewQueueProps) {
  const [open, setOpen] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const due = useMemo(() => {
    return Object.values(PROBLEM_CATALOG)
      .filter((p) => isDue(progress[p.id]))
      .sort((a, b) => overdueDays(progress[b.id]) - overdueDays(progress[a.id]))
  }, [progress])

  const visible = showAll ? due : due.slice(0, MAX_VISIBLE)

  return (
    <section className="overflow-hidden rounded-2xl border border-google-blue/30 bg-elevated shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 border-l-4 border-google-blue px-4 py-3 text-left"
      >
        <CalendarClock size={18} className="text-google-blue" />
        <h2 className="font-display text-base font-bold">Review Queue</h2>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
            due.length > 0
              ? 'bg-google-blue/15 text-google-blue'
              : 'bg-google-green/15 text-google-green',
          )}
        >
          {due.length > 0 ? `${due.length} due` : 'all caught up'}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            'ml-auto text-muted transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="border-t border-line">
          {due.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              🎉 Nothing due for review. Rate a solved problem 3★ or below, or
              come back as your reviews come due.
            </p>
          ) : (
            <>
              <ul className="max-h-[24rem] divide-y divide-line overflow-y-auto">
                {visible.map((problem) => {
                  const p = progress[problem.id]!
                  const due = dueDate(p)
                  return (
                    <li
                      key={problem.id}
                      className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1 font-medium text-ink hover:text-google-blue hover:underline"
                        >
                          <span className="truncate">{problem.name}</span>
                          <ExternalLink
                            size={12}
                            className="shrink-0 text-muted opacity-0 group-hover:opacity-100"
                          />
                        </a>
                        <p className="text-xs text-muted">
                          {due ? `Due ${relativeDays(due)}` : 'Due for review'}
                        </p>
                      </div>

                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          DIFFICULTY_BADGE[problem.difficulty],
                        )}
                      >
                        {problem.difficulty}
                      </span>

                      <StarRating
                        value={p.confidence ?? 0}
                        onChange={(v) => onReview(problem.id, v)}
                        label={`Re-rate ${problem.name}`}
                      />

                      <button
                        type="button"
                        onClick={() => onReview(problem.id)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-google-blue px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        <Check size={13} /> Reviewed
                      </button>
                    </li>
                  )
                })}
              </ul>
              {due.length > MAX_VISIBLE && (
                <button
                  type="button"
                  onClick={() => setShowAll((s) => !s)}
                  className="w-full border-t border-line py-2 text-center text-xs font-medium text-google-blue hover:bg-surface"
                >
                  {showAll ? 'Show less' : `Show ${due.length - MAX_VISIBLE} more`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
