import { memo, useEffect, useState } from 'react'
import { ChevronDown, ExternalLink, Flag, RotateCcw, X } from 'lucide-react'
import type { Confidence, Frequency, Problem, ProblemProgress } from '../data/types'
import { cn, CONFIDENCE_COLOR, DIFFICULTY_BADGE } from '../lib/ui'
import { formatDate, maxDate, relativeDays, todayISO } from '../lib/dates'
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

/** The set of row mutations, threaded down as one stable bundle. */
export interface RowHandlers {
  onToggleExpand: (id: string) => void
  onSetConfidence: (id: string, v: Confidence) => void
  onClearRating: (id: string) => void
  onSetNotes: (id: string, notes: string) => void
  onToggleFlag: (id: string) => void
  onSetDateSolved: (id: string, date: string) => void
  onRemoveAttempt: (id: string, index: number) => void
  onEditAttemptDate: (id: string, index: number, date: string) => void
  onEditAttemptRating: (id: string, index: number, value: Confidence | 0) => void
}

export interface ProblemRowProps extends RowHandlers {
  problem: Problem
  progress?: ProblemProgress
  frequency?: Frequency
  expanded: boolean
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
  onToggleFlag,
  onSetDateSolved,
  onRemoveAttempt,
  onEditAttemptDate,
  onEditAttemptRating,
}: ProblemRowProps) {
  const { id } = problem
  const confidence = progress?.confidence ?? 0
  const solved = confidence > 0
  const flagged = !!progress?.flagged
  const attempts = progress?.confidenceHistory?.length ?? 0
  const needsReview = solved && confidence <= 3
  // The subtitle shows the *most recent* attempt, not the first solve. Take the
  // later of the two so a manually-edited "First solved" can't read as stale.
  const lastSolved = maxDate(progress?.lastReviewed, progress?.dateSolved)

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
        className="flex cursor-pointer items-center gap-2.5 px-3 py-1 sm:px-4"
      >
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <StarRating
            value={confidence}
            size={16}
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
              className="group inline-flex items-center gap-1 truncate font-medium leading-tight text-ink hover:text-google-blue hover:underline"
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
            <p className="mt-px truncate text-xs leading-tight text-muted">
              {attempts > 1 ? 'Last solved' : 'Solved'}{' '}
              {lastSolved ? relativeDays(lastSolved) : ''}
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
            'shrink-0 rounded-full p-1 transition-colors',
            flagged
              ? 'text-google-blue'
              : 'text-line hover:text-muted',
          )}
        >
          <Flag size={15} className={cn(flagged && 'fill-google-blue')} />
        </button>

        <ChevronDown
          size={16}
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
          onToggleFlag={onToggleFlag}
          onSetDateSolved={onSetDateSolved}
          onRemoveAttempt={onRemoveAttempt}
          onEditAttemptDate={onEditAttemptDate}
          onEditAttemptRating={onEditAttemptRating}
        />
      )}
    </li>
  )
}

// ── Date field ──────────────────────────────────────────────────────────────

interface DateFieldProps {
  /** The saved date, as YYYY-MM-DD. */
  value: string
  /** Latest date the user may pick, as YYYY-MM-DD. */
  max?: string
  id?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  /** Called with the new YYYY-MM-DD once the edit is committed. */
  onCommit: (date: string) => void
  /** Called when the edit ends without a change (Escape, or an unchanged blur). */
  onCancel?: () => void
}

/**
 * A date input that holds its own draft while you type and only reports upward
 * on Enter or blur.
 *
 * Native date inputs fire `change` the moment their segments happen to form a
 * valid date, so saving on every change clobbers a half-typed day — typing "26"
 * commits "the 2nd" after the first digit, which then re-renders the field out
 * from under you. Buffering until commit lets you finish typing.
 */
function DateField({ value, max, onCommit, onCancel, ...input }: DateFieldProps) {
  const [draft, setDraft] = useState(value)

  // Re-sync if the saved date changes elsewhere (a new attempt, an undo, a sync).
  useEffect(() => setDraft(value), [value])

  const revert = () => {
    setDraft(value)
    onCancel?.()
  }

  // Cleared, unchanged, or past `max` (which the picker forbids but typing can
  // still reach) all mean "nothing to save".
  const commit = () => {
    if (!draft || draft === value || (max && draft > max)) revert()
    else onCommit(draft)
  }

  return (
    <input
      {...input}
      type="date"
      max={max}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          revert()
        }
      }}
      onBlur={commit}
    />
  )
}

// ── Inline log panel ────────────────────────────────────────────────────────

interface LogPanelProps {
  problem: Problem
  progress?: ProblemProgress
  onSetConfidence: (id: string, v: Confidence) => void
  onClearRating: (id: string) => void
  onSetNotes: (id: string, notes: string) => void
  onToggleFlag: (id: string) => void
  onSetDateSolved: (id: string, date: string) => void
  onRemoveAttempt: (id: string, index: number) => void
  onEditAttemptDate: (id: string, index: number, date: string) => void
  onEditAttemptRating: (id: string, index: number, value: Confidence | 0) => void
}

function LogPanel({
  problem,
  progress,
  onSetConfidence,
  onClearRating,
  onSetNotes,
  onSetDateSolved,
  onRemoveAttempt,
  onEditAttemptDate,
  onEditAttemptRating,
}: LogPanelProps) {
  const { id } = problem
  const confidence = progress?.confidence ?? 0
  const solved = confidence > 0
  const history = progress?.confidenceHistory ?? []
  const [editingDate, setEditingDate] = useState<number | null>(null)
  const [editingRating, setEditingRating] = useState<number | null>(null)

  return (
    <div className="animate-fade-in border-t border-line bg-surface px-3 py-3 sm:px-4">
      <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
        {/* Left: rating, date + attempts, and every dated attempt */}
        <div className="space-y-3">
          {/* Confidence + status */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              Confidence {solved ? '(solved)' : '(rate to mark solved)'}
            </label>
            <div className="flex items-center gap-3">
              <StarRating
                value={confidence}
                size={20}
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

          {/* First solved */}
          <div>
            <label
              htmlFor={`date-${id}`}
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              First solved
            </label>
            <DateField
              id={`date-${id}`}
              max={todayISO()}
              disabled={!solved}
              value={progress?.dateSolved ?? todayISO()}
              onCommit={(date) => onSetDateSolved(id, date)}
              className="rounded-lg border border-line bg-elevated px-3 py-1.5 text-sm text-ink disabled:opacity-50"
            />
          </div>

        </div>

        {/* Right: notes + dates solved (two items to balance the columns) */}
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`notes-${id}`}
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
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

          {history.length > 0 && (
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Dates solved ({history.length})
              </span>
              <ul className="flex flex-wrap gap-1.5">
                {history.map((pt, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-line/50 py-0.5 pl-2 pr-1 text-xs text-muted"
                  >
                    {editingRating === i ? (
                      <span className="inline-flex items-center gap-1">
                        <StarRating
                          value={pt.value}
                          size={13}
                          onChange={(v) => {
                            onEditAttemptRating(id, i, v)
                            setEditingRating(null)
                          }}
                          label="Edit attempt rating"
                        />
                        {pt.value ? (
                          <button
                            type="button"
                            onClick={() => {
                              onEditAttemptRating(id, i, 0)
                              setEditingRating(null)
                            }}
                            title="Clear rating"
                            className="px-0.5 text-muted/60 hover:text-ink"
                          >
                            —
                          </button>
                        ) : null}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingRating(i)}
                        title="Edit rating"
                        className="font-semibold"
                        style={pt.value ? { color: CONFIDENCE_COLOR[pt.value] } : undefined}
                      >
                        {pt.value ? (
                          `${pt.value}★`
                        ) : (
                          <span className="text-muted/50">☆</span>
                        )}
                      </button>
                    )}
                    {editingDate === i ? (
                      <DateField
                        autoFocus
                        max={todayISO()}
                        value={pt.date}
                        onCommit={(date) => {
                          onEditAttemptDate(id, i, date)
                          setEditingDate(null)
                        }}
                        onCancel={() => setEditingDate(null)}
                        className="rounded border border-line bg-elevated px-1 py-0 text-xs text-ink"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingDate(i)}
                        title="Edit date"
                        className="hover:text-ink hover:underline"
                      >
                        {formatDate(pt.date)}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveAttempt(id, i)}
                      aria-label={`Remove attempt on ${formatDate(pt.date)}`}
                      className="ml-0.5 rounded-full p-0.5 text-muted/60 transition-colors hover:bg-line hover:text-google-red"
                    >
                      <X size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const ProblemRow = memo(ProblemRowImpl)
