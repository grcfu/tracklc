import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { pct } from '../lib/ui'

interface HeaderProps {
  /** Label of the list the progress bar reflects, e.g. "Blind 75". */
  label: string
  solved: number
  total: number
  /** Header-right slot for actions (settings, etc.). */
  right?: ReactNode
}

/** App header: wordmark, tagline, and the active list's progress bar. */
export function Header({ label, solved, total, right }: HeaderProps) {
  const percent = pct(solved, total)

  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Logo className="text-3xl sm:text-4xl" />
          <p className="mt-1 text-sm text-muted">
            Track smarter — spaced-repetition practice, not just checkboxes.
          </p>
        </div>
        {right && <div className="flex shrink-0 items-center gap-1">{right}</div>}
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-medium text-muted">{label}</span>
          <span className="font-display text-sm font-semibold">
            <span className="text-google-blue">{solved}</span>
            <span className="text-muted"> / {total} solved</span>
            <span className="ml-2 text-muted">· {percent}%</span>
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-line/60"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress: ${solved} of ${total} solved`}
        >
          <div
            className="h-full rounded-full bg-google-blue transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </header>
  )
}
