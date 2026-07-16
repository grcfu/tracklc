import { useMemo, useState } from 'react'
import type { CompanyId, ListId } from './data/types'
import { listProblems, LIST_LABELS } from './data/lists'
import { COMPANY_META, COMPANY_ORDER } from './data/companies'
import { useProgress } from './hooks/useProgress'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'

export default function App() {
  const api = useProgress()
  const { progress } = api

  const [tab, setTab] = useState<ListId>('blind75')
  const [company, setCompany] = useState<CompanyId>('google')

  const problems = useMemo(
    () => listProblems(tab, company),
    [tab, company],
  )

  const solved = useMemo(
    () => problems.filter((p) => progress[p.id]?.confidence != null).length,
    [problems, progress],
  )

  const label =
    tab === 'company' ? `${COMPANY_META[company].label} · Frequently asked` : LIST_LABELS[tab]

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Header label={label} solved={solved} total={problems.length} />

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <TabBar active={tab} onChange={setTab} />
          {tab === 'company' && (
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value as CompanyId)}
              className="rounded-full border border-line bg-elevated px-4 py-2 text-sm font-medium text-ink"
              aria-label="Select company"
            >
              {COMPANY_ORDER.map((id) => (
                <option key={id} value={id}>
                  {COMPANY_META[id].label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <p className="text-muted">
            {problems.length} problems in <strong>{label}</strong>. Problem list
            UI lands next.
          </p>
        </div>
      </div>
    </div>
  )
}
