import { useMemo, useState } from 'react'
import { CalendarDays, Check, Copy } from 'lucide-react'
import type { ProblemProgress } from '../data/types'
import { addDays, formatDayHeading, todayISO } from '../lib/dates'
import { buildActivityLog, countEvents, formatLogText } from '../lib/activityLog'
import { cn, DIFFICULTY_BADGE } from '../lib/ui'
import { Modal } from './Modal'

interface ActivityLogProps {
  progress: Record<string, ProblemProgress>
  onClose: () => void
}

const PRESETS: { label: string; days: number }[] = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

const EPOCH = '2000-01-01'

/**
 * Date-range report of everything solved or reviewed, grouped by day. Copies
 * out as plain text to paste into a message ("here's what I did since we met").
 */
export function ActivityLog({ progress, onClose }: ActivityLogProps) {
  const today = todayISO()
  const [from, setFrom] = useState(() => addDays(today, -6))
  const [to, setTo] = useState(today)
  const [copied, setCopied] = useState(false)

  const days = useMemo(
    () => buildActivityLog(progress, from, to),
    [progress, from, to],
  )
  const total = countEvents(days)

  const applyPreset = (n: number) => {
    setFrom(addDays(today, -(n - 1)))
    setTo(today)
  }
  const applyAllTime = () => {
    setFrom(EPOCH)
    setTo(today)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatLogText(days))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const dateInput =
    'rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink'

  return (
    <Modal
      title="Activity log"
      onClose={onClose}
      wide
      icon={<CalendarDays size={18} className="text-google-blue" />}
    >
      {/* Range controls */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p.days)}
            className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={applyAllTime}
          className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          All time
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-muted">
          From{' '}
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className={cn('ml-1', dateInput)}
          />
        </label>
        <label className="text-xs font-medium text-muted">
          To{' '}
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={(e) => setTo(e.target.value)}
            className={cn('ml-1', dateInput)}
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{total}</span>{' '}
          {total === 1 ? 'entry' : 'entries'} across{' '}
          <span className="font-semibold text-ink">{days.length}</span>{' '}
          {days.length === 1 ? 'day' : 'days'}
        </p>
        <button
          type="button"
          onClick={copy}
          disabled={total === 0}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-google-blue px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy as text'}
        </button>
      </div>

      {/* Scrollable grouped list */}
      <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-line">
        {days.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No problems solved or reviewed in this range.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {days.map((day) => (
              <li key={day.date} className="p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {formatDayHeading(day.date)}
                </p>
                <ul className="space-y-1">
                  {day.events.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center gap-2 text-sm text-ink"
                    >
                      <span className="min-w-0 flex-1 truncate">{e.name}</span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                          DIFFICULTY_BADGE[e.difficulty],
                        )}
                      >
                        {e.difficulty}
                      </span>
                      <span className="w-16 shrink-0 text-right text-xs text-muted">
                        {e.rating ? `${e.rating}★` : 'reviewed'}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
