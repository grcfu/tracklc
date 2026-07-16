import { useEffect } from 'react'
import { RotateCcw, X } from 'lucide-react'

interface ToastProps {
  message: string
  /** When present, renders an Undo button that runs this then dismisses. */
  onUndo?: () => void
  onDismiss: () => void
}

/** Bottom-centered snackbar with an optional Undo. Auto-dismisses after 8s. */
export function Toast({ message, onUndo, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, 8000)
    return () => window.clearTimeout(t)
  }, [message, onUndo, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div className="flex items-center gap-3 rounded-full border border-line bg-elevated py-2 pl-4 pr-2 text-sm text-ink shadow-cardHover animate-slide-up">
        <span>{message}</span>
        {onUndo && (
          <button
            type="button"
            onClick={() => {
              onUndo()
              onDismiss()
            }}
            className="inline-flex items-center gap-1 rounded-full bg-google-blue px-3 py-1 text-xs font-medium text-white hover:opacity-90"
          >
            <RotateCcw size={13} /> Undo
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="rounded-full p-1 text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
