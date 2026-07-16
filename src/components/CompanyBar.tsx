import { AlertTriangle, ChevronDown } from 'lucide-react'
import type { CompanyId } from '../data/types'
import { COMPANY_META, COMPANY_ORDER } from '../data/companies'
import { cn } from '../lib/ui'

export type CompanyGrouping = 'frequency' | 'category'

interface CompanyBarProps {
  company: CompanyId
  onCompanyChange: (id: CompanyId) => void
  grouping: CompanyGrouping
  onGroupingChange: (g: CompanyGrouping) => void
}

/** Company picker + grouping toggle + the community-sourced disclaimer. */
export function CompanyBar({
  company,
  onCompanyChange,
  grouping,
  onGroupingChange,
}: CompanyBarProps) {
  const meta = COMPANY_META[company]

  return (
    <div className="mb-5 rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Company dropdown */}
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: meta.color }}
            aria-hidden
          />
          <select
            value={company}
            onChange={(e) => onCompanyChange(e.target.value as CompanyId)}
            aria-label="Select company"
            className="appearance-none rounded-full border border-line bg-elevated py-2 pl-7 pr-9 font-display text-sm font-semibold text-ink"
          >
            {COMPANY_ORDER.map((id) => (
              <option key={id} value={id}>
                {COMPANY_META[id].label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden
          />
        </div>

        {/* Grouping toggle */}
        <div
          role="group"
          aria-label="Group problems by"
          className="inline-flex rounded-full border border-line bg-elevated p-0.5 text-sm"
        >
          {(['frequency', 'category'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGroupingChange(g)}
              aria-pressed={grouping === g}
              className={cn(
                'rounded-full px-3 py-1.5 font-medium capitalize transition-colors',
                grouping === g
                  ? 'bg-google-blue text-white'
                  : 'text-muted hover:text-ink',
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 flex items-start gap-2 text-xs text-muted">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-google-yellow" />
        <span>
          <strong className="font-semibold text-ink">
            Community-sourced — not official.
          </strong>{' '}
          Curated from widely-shared frequency compilations, not LeetCode's
          Premium company tags. Real tags change over time — use this as a study
          guide, not a guarantee.
        </span>
      </p>
    </div>
  )
}
