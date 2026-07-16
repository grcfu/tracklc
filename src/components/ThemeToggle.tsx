import { Moon, Sun } from 'lucide-react'
import type { Theme } from '../data/types'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

/** Sun/Moon button that flips between light and dark. Bound to the "d" shortcut. */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode (d)' : 'Dark mode (d)'}
      className="rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-ink"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
