import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  /** Optional icon shown left of the title. */
  icon?: ReactNode
  /** Wider shell (max-w-2xl) for report-style content. */
  wide?: boolean
}

/** Accessible modal shell: dimmed backdrop, Escape/backdrop-click to close. */
export function Modal({ title, onClose, children, icon, wide }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-black/40 animate-fade-in" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={
          'relative z-10 flex max-h-[85vh] w-full flex-col rounded-2xl border border-line bg-elevated p-6 shadow-cardHover animate-slide-up ' +
          (wide ? 'max-w-2xl' : 'max-w-md')
        }
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            {icon}
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
