import { memo } from 'react'
import {
  ChevronDown,
  ExternalLink,
  Flag,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react'
import type { Confidence, Frequency, Problem, ProblemProgress } from '../data/types'
import { cn, DIFFICULTY_BADGE } from '../lib/ui'
import { formatDate, relativeDays, todayISO } from '../lib/dates'
import { StarRating } from './StarRating'

const FREQUENCY_LABEL: Record<Frequency, string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
}
const FREQUENCY_CLASS: Record<Frequency, string> = {
  high: 'bg-google-red/10 text-google-red',
  medium: 'bg-google-yellow/20 text-amber-700 dark:text-google-yellow',
  low: 'bg-line/60 text-muted',
}

export interface ProblemRowProps {
  problem: Problem
  progress?: ProblemProgress
  frequency?: Frequency
  expanded: boolean
  onToggleExpand: (id: string) => void
  onSetConfidence: (id: string, v: Confidence) => void
  onClearRating: (id: string) => void
  onSetNotes: (id: string, notes: string) => void
  onSetAttempts: (id: string, n: number) => void
  onToggleFlag: (id: string) => void
  onSetDateSolved: (id: string, date: string) => void
}

function ProblemRowImpl({
  problem,
  progress,
  frequency,
  expanded,
  onToggleExpand,
  onSetConfidence,
  onClearRating,
  onSetNotes,
  onSetAttempts,
  onToggleFlag,
  onSetDateSolved,
}: ProblemRowProps) {
  const { id } = problem
  const confidence = progress?.confidence ?? 0
  const solved = confidence > 0
  const flagged = !!progress?.flagged
  const attempts = progress?.attempts ?? 0
  const needsReview = solved && confidence <= 3

  const toggle = () => onToggleExpand(id)
  const onRowKey = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <li className="overflow-hidden rounded-xl border border-line bg-elevated shadow-sm transition-shadow hover:shadow-card">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${problem.name} — ${solved ? `rated ${confidence} of 5` : 'unattempted'}. Toggle details.`}
        onClick={toggle}
        onKeyDown={onRowKey}
        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 sm:px-4"
      >
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <StarRating
            value={confidence}
            onChange={(v) => onSetConfidence(id, v)}
            label={`Confidence for ${problem.name}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={problem.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="group inline-flex items-center gap-1 truncate font-medium text-ink hover:text-google-blue hover:underline"
              title={`Open ${problem.name} on LeetCode`}
            >
              <span className="truncate">{problem.name}</span>
              <ExternalLink
                size={13}
                className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
              />
            </a>
          </div>
          {solved && (
            <p className="mt-0.5 truncate text-xs text-muted">
              Solved {progress?.dateSolved ? relativeDays(progress.dateSolved) : ''}
              {attempts > 0 && ` · ${attempts} attempt${attempts > 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {frequency && (
          <span
            className={cn(
              'hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-block',
              FREQUENCY_CLASS[frequency],
            )}
            title={`${FREQUENCY_LABEL[frequency]} frequency`}
          >
            {FREQUENCY_LABEL[frequency]}
          </span>
        )}

        {needsReview && (
          <span className="hidden shrink-0 rounded-full bg-google-blue/10 px-2 py-0.5 text-[11px] font-semibold text-google-blue sm:inline-block">
            Review
          </span>
        )}

        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            DIFFICULTY_BADGE[problem.difficulty],
          )}
        >
          {problem.difficulty}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFlag(id)
          }}
          aria-pressed={flagged}
          aria-label={flagged ? 'Remove bookmark' : 'Bookmark this problem'}
          className={cn(
            'shrink-0 rounded-full p-1.5 transition-colors',
            flagged
              ? 'text-google-blue'
              : 'text-line hover:text-muted',
          )}
        >
          <Flag size={16} className={cn(flagged && 'fill-google-blue')} />
        </button>

        <ChevronDown
          size={18}
          className={cn(
            'shrink-0 text-muted transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </div>

      {expanded && (
        <LogPanel
          problem={problem}
          progress={progress}
          onSetConfidence={onSetConfidence}
          onClearRating={onClearRating}
          onSetNotes={onSetNotes}
          onSetAttempts={onSetAttempts}
          onToggleFlag={onToggleFlag}
          onSetDateSolved={onSetDateSolved}
        />
      )}
    </li>
  )
}

// ── Inline log panel ────────────────────────────────────────────────────────

interface LogPanelProps {
  problem: Problem
  progress?: ProblemProgress
  onSetConfidence: (id: string, v: Confidence) => void
  onClearRating: (id: string) => void
  onSetNotes: (id: string, notes: string) => void
  onSetAttempts: (id: string, n: number) => void
  onToggleFlag: (id: string) => void
  onSetDateSolved: (id: string, date: string) => void
}

function LogPanel({
  problem,
  progress,
  onSetConfidence,
  onClearRating,
  onSetNotes,
  onSetAttempts,
  onSetDateSolved,
}: LogPanelProps) {
  const { id } = problem
  const confidence = progress?.confidence ?? 0
  const solved = confidence > 0
  const attempts = progress?.attempts ?? 0
  const history = progress?.confidenceHistory ?? []

  return (
    <div className="animate-fade-in border-t border-line bg-surface px-3 py-4 sm:px-4">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Confidence + status */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Confidence {solved ? '(solved)' : '(rate to mark solved)'}
          </label>
          <div className="flex items-center gap-3">
            <StarRating
              value={confidence}
              size={24}
              onChange={(v) => onSetConfidence(id, v)}
              label={`Confidence for ${problem.name}`}
            />
            {solved && (
              <button
                type="button"
                onClick={() => onClearRating(id)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-line/40 hover:text-ink"
              >
                <RotateCcw size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Date solved */}
        <div>
          <label
            htmlFor={`date-${id}`}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Date solved
          </label>
          <input
            id={`date-${id}`}
            type="date"
            max={todayISO()}
            disabled={!solved}
            value={progress?.dateSolved ?? todayISO()}
            onChange={(e) => onSetDateSolved(id, e.target.value)}
            className="w-full rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-ink disabled:opacity-50"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label
            htmlFor={`notes-${id}`}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Notes — key insight / pattern / mistake to avoid
          </label>
          <textarea
            id={`notes-${id}`}
            rows={3}
            defaultValue={progress?.notes ?? ''}
            onBlur={(e) => onSetNotes(id, e.target.value)}
            placeholder="e.g. Hash map, one pass. Watch for using the same element twice."
            className="w-full resize-y rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-ink placeholder:text-muted/70"
          />
        </div>

        {/* Attempts */}
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Attempts
          </span>
          <div className="inline-flex items-center gap-3 rounded-lg border border-line bg-elevated px-2 py-1">
            <button
              type="button"
              onClick={() => onSetAttempts(id, attempts - 1)}
              disabled={attempts <= 0}
              aria-label="Decrease attempts"
              className="rounded-md p-1.5 text-muted hover:bg-line/40 hover:text-ink disabled:opacity-40"
            >
              <Minus size={15} />
            </button>
            <span className="min-w-[1.5rem] text-center font-display font-semibold tabular-nums">
              {attempts}
            </span>
            <button
              type="button"
              onClick={() => onSetAttempts(id, attempts + 1)}
              aria-label="Increase attempts"
              className="rounded-md p-1.5 text-muted hover:bg-line/40 hover:text-ink"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* Confidence history */}
        {history.length > 0 && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Confidence history
            </span>
            <ul className="flex flex-wrap gap-1.5">
              {history.slice(-8).map((pt, i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-line/50 px-2 py-0.5 text-xs text-muted"
                  title={formatDate(pt.date)}
                >
                  <span className="font-semibold text-google-yellow">
                    {pt.value}★
                  </span>
                  <span>{relativeDays(pt.date)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export const ProblemRow = memo(ProblemRowImpl)
