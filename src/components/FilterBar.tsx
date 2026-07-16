import { Search, X } from 'lucide-react'
import type { Difficulty } from '../data/types'
import {
  isFiltering,
  type FilterState,
  type SortKey,
  type StatusFilter,
} from '../lib/filters'
import { cn, DIFFICULTY_ORDER } from '../lib/ui'

interface FilterBarProps {
  filters: FilterState
  onChange: (patch: Partial<FilterState>) => void
  onReset: () => void
}

const STATUSES: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'solved', label: 'Solved' },
  { id: 'unsolved', label: 'Unsolved' },
  { id: 'review', label: 'Needs Review' },
]

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'default', label: 'List order' },
  { id: 'difficulty', label: 'Difficulty' },
  { id: 'confidence', label: 'Confidence (weakest)' },
  { id: 'recent', label: 'Recently solved' },
  { id: 'overdue', label: 'Most overdue' },
]

const DIFF_CHIP: Record<Difficulty, string> = {
  Easy: 'data-[on=true]:bg-google-green/15 data-[on=true]:text-google-green data-[on=true]:border-google-green/40',
  Medium:
    'data-[on=true]:bg-google-yellow/20 data-[on=true]:text-amber-700 dark:data-[on=true]:text-google-yellow data-[on=true]:border-google-yellow/50',
  Hard: 'data-[on=true]:bg-google-red/10 data-[on=true]:text-google-red data-[on=true]:border-google-red/40',
}

/** Search box + difficulty/status filter chips + sort selector. */
export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const toggleDifficulty = (d: Difficulty) => {
    const has = filters.difficulties.includes(d)
    onChange({
      difficulties: has
        ? filters.difficulties.filter((x) => x !== d)
        : [...filters.difficulties, d],
    })
  }

  return (
    <div className="mb-5 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          id="search"
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder="Search problems…"
          aria-label="Search problems by name"
          className="w-full rounded-full border border-line bg-elevated py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-muted focus:border-google-blue"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Difficulty chips */}
        <div className="flex items-center gap-1.5">
          {DIFFICULTY_ORDER.map((d) => {
            const on = filters.difficulties.includes(d)
            return (
              <button
                key={d}
                type="button"
                data-on={on}
                aria-pressed={on}
                onClick={() => toggleDifficulty(d)}
                className={cn(
                  'rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink',
                  DIFF_CHIP[d],
                )}
              >
                {d}
              </button>
            )
          })}
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-1.5">
          {STATUSES.map((s) => {
            const on = filters.status === s.id
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ status: s.id })}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  on
                    ? 'border-google-blue bg-google-blue/10 text-google-blue'
                    : 'border-line text-muted hover:text-ink',
                )}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="sort" className="text-xs font-medium text-muted">
            Sort
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
            className="rounded-full border border-line bg-elevated px-3 py-1.5 text-xs font-medium text-ink"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {isFiltering(filters) && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted hover:text-google-red"
          >
            <X size={13} /> Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
