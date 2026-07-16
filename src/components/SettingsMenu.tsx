import { useEffect, useRef, useState } from 'react'
import {
  Download,
  Minus,
  Plus,
  RotateCcw,
  Settings,
  Upload,
} from 'lucide-react'
import { relativeDays } from '../lib/dates'
import { clamp } from '../lib/ui'

interface SettingsMenuProps {
  dailyGoal: number
  onSetDailyGoal: (n: number) => void
  lastBackup?: string
  onExport: () => void
  onImport: (file: File) => void
  onReset: () => void
}

/**
 * Gear dropdown for data + preferences: daily-goal stepper, Export / Import
 * backups, and a guarded Reset. Destructive actions raise an undo toast in the
 * parent; this component only handles the menu UI, the file picker, and the
 * reset confirmation.
 */
export function SettingsMenu({
  dailyGoal,
  onSetDailyGoal,
  lastBackup,
  onExport,
  onImport,
  onReset,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pickFile = () => fileRef.current?.click()

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (file) {
      onImport(file)
      setOpen(false)
    }
  }

  const confirmReset = () => {
    const ok = window.confirm(
      'Reset all progress? Your ratings, notes, and history will be cleared. ' +
        'You can undo right after, or Export a backup first.',
    )
    if (ok) {
      onReset()
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Settings and data"
        title="Settings & data"
        className="rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-ink"
      >
        <Settings size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-72 origin-top-right rounded-2xl border border-line bg-elevated p-4 shadow-cardHover animate-fade-in"
        >
          {/* Daily goal */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Daily goal
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSetDailyGoal(clamp(dailyGoal - 1, 1, 50))}
                aria-label="Decrease daily goal"
                className="rounded-full border border-line p-1.5 text-muted transition-colors hover:text-ink disabled:opacity-40"
                disabled={dailyGoal <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="min-w-[3ch] text-center font-display text-lg font-semibold text-ink">
                {dailyGoal}
              </span>
              <button
                type="button"
                onClick={() => onSetDailyGoal(clamp(dailyGoal + 1, 1, 50))}
                aria-label="Increase daily goal"
                className="rounded-full border border-line p-1.5 text-muted transition-colors hover:text-ink disabled:opacity-40"
                disabled={dailyGoal >= 50}
              >
                <Plus size={14} />
              </button>
              <span className="text-xs text-muted">problems / day</span>
            </div>
          </div>

          <div className="my-3 h-px bg-line" />

          {/* Data */}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Your data
          </p>
          <div className="space-y-1">
            <button
              type="button"
              role="menuitem"
              onClick={onExport}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-ink transition-colors hover:bg-surface"
            >
              <Download size={16} className="text-muted" />
              Export backup (.json)
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={pickFile}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-ink transition-colors hover:bg-surface"
            >
              <Upload size={16} className="text-muted" />
              Import backup…
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={confirmReset}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-google-red transition-colors hover:bg-google-red/10"
            >
              <RotateCcw size={16} />
              Reset all progress
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={onFileChange}
            className="hidden"
          />

          <p className="mt-3 text-xs text-muted">
            {lastBackup
              ? `Last export ${relativeDays(lastBackup)}.`
              : 'Your data lives only in this browser — export to keep a backup.'}
          </p>
        </div>
      )}
    </div>
  )
}
