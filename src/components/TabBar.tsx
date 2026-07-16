import type { ListId } from '../data/types'
import { cn } from '../lib/ui'

interface Tab {
  id: ListId
  label: string
}

const TABS: Tab[] = [
  { id: 'blind75', label: 'Blind 75' },
  { id: 'neetcode150', label: 'NeetCode 150' },
  { id: 'company', label: 'Company Specific' },
]

interface TabBarProps {
  active: ListId
  onChange: (id: ListId) => void
}

/** Pill-style tab bar for switching between the three lists. */
export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Problem lists"
      className="inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1 no-scrollbar sm:w-auto"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-google-blue text-white shadow-sm'
                : 'text-muted hover:bg-elevated hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
