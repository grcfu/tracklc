import { useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Frequency, Problem, ProblemProgress } from '../data/types'
import { cn, pct } from '../lib/ui'
import { ProblemRow, type RowHandlers } from './ProblemRow'

interface CategorySectionProps {
  title: string
  problems: Problem[]
  progress: Record<string, ProblemProgress>
  frequencyOf?: Map<string, Frequency>
  collapsed: boolean
  onToggleCollapse: (title: string) => void
  expandedRows: Set<string>
  handlers: RowHandlers
  /** Render at most this many rows; the rest load on demand. */
  limit?: number
  onShowMore?: () => void
}

/** Calls `onShowMore` as the button nears the viewport, so rows load while scrolling. */
function ShowMore({ left, onShowMore }: { left: number; onShowMore: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && onShowMore(),
      { rootMargin: '800px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [left, onShowMore])

  return (
    <button
      ref={ref}
      type="button"
      onClick={onShowMore}
      className="w-full rounded-xl border border-dashed border-line py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
    >
      Show more ({left} left)
    </button>
  )
}

/** A collapsible category with a per-category progress header and its rows. */
export function CategorySection({
  title,
  problems,
  progress,
  frequencyOf,
  collapsed,
  onToggleCollapse,
  expandedRows,
  handlers,
  limit = Infinity,
  onShowMore,
}: CategorySectionProps) {
  const solved = problems.filter((p) => progress[p.id]?.confidence != null).length
  const total = problems.length
  const percent = pct(solved, total)
  const complete = solved === total && total > 0

  return (
    <section className="mb-3">
      <button
        type="button"
        onClick={() => onToggleCollapse(title)}
        aria-expanded={!collapsed}
        className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface"
      >
        <ChevronRight
          size={18}
          className={cn(
            'shrink-0 text-muted transition-transform duration-200',
            !collapsed && 'rotate-90',
          )}
        />
        <h2 className="font-display text-sm font-semibold tracking-wide text-ink">
          {title}
        </h2>
        <span
          className={cn(
            'ml-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
            complete
              ? 'bg-google-green/15 text-google-green'
              : 'bg-line/60 text-muted',
          )}
        >
          {solved}/{total}
        </span>
        <div className="ml-auto hidden w-28 sm:block">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500 ease-out',
                complete ? 'bg-google-green' : 'bg-google-blue',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </button>

      {!collapsed && (
        <ul className="mt-1.5 space-y-1.5 pl-1">
          {problems.slice(0, limit).map((problem) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              progress={progress[problem.id]}
              frequency={frequencyOf?.get(problem.id)}
              expanded={expandedRows.has(problem.id)}
              {...handlers}
            />
          ))}
          {problems.length > limit && onShowMore && (
            <li>
              <ShowMore left={problems.length - limit} onShowMore={onShowMore} />
            </li>
          )}
        </ul>
      )}
    </section>
  )
}
