import { Keyboard } from 'lucide-react'
import { Modal } from './Modal'

/** Keep this in sync with the handler map wired up in App. */
export const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['/'], description: 'Search problems' },
  { keys: ['1'], description: 'Blind 75 tab' },
  { keys: ['2'], description: 'NeetCode 150 tab' },
  { keys: ['3'], description: 'Company tab' },
  { keys: ['d'], description: 'Toggle dark mode' },
  { keys: ['l'], description: 'Activity log' },
  { keys: ['s'], description: 'Share progress' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close dialogs' },
]

interface ShortcutsHelpProps {
  onClose: () => void
}

/** Modal cheat-sheet of the app's global keyboard shortcuts. */
export function ShortcutsHelp({ onClose }: ShortcutsHelpProps) {
  return (
    <Modal
      title="Keyboard shortcuts"
      onClose={onClose}
      icon={<Keyboard size={18} className="text-google-blue" />}
    >
      <ul className="divide-y divide-line">
        {SHORTCUTS.map((s) => (
          <li
            key={s.description}
            className="flex items-center justify-between py-2.5"
          >
            <span className="text-sm text-ink">{s.description}</span>
            <span className="flex gap-1">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className="min-w-[1.75rem] rounded-md border border-line bg-surface px-2 py-1 text-center font-sans text-xs font-medium text-muted"
                >
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
