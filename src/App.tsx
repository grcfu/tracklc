import { useCallback, useMemo, useState } from 'react'
import type { CompanyId, Frequency, ListId } from './data/types'
import { companyProblems, listProblems, LIST_LABELS } from './data/lists'
import { COMPANY_META, COMPANY_ORDER } from './data/companies'
import { useProgress } from './hooks/useProgress'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'
import { ProblemRow } from './components/ProblemRow'

export default function App() {
  const api = useProgress()
  const { progress } = api

  const [tab, setTab] = useState<ListId>('blind75')
  const [company, setCompany] = useState<CompanyId>('google')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const problems = useMemo(
    () => listProblems(tab, company),
    [tab, company],
  )

  /** Frequency lookup (only populated on the company tab). */
  const frequencyOf = useMemo(() => {
    if (tab !== 'company') return undefined
    const map = new Map<string, Frequency>()
    for (const cp of companyProblems(company)) map.set(cp.problem.id, cp.frequency)
    return map
  }, [tab, company])

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

        <ul className="space-y-2">
          {problems.map((problem) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              progress={progress[problem.id]}
              frequency={frequencyOf?.get(problem.id)}
              expanded={expanded.has(problem.id)}
              onToggleExpand={toggleExpand}
              onSetConfidence={api.setConfidence}
              onClearRating={api.clearRating}
              onSetNotes={api.setNotes}
              onSetAttempts={api.setAttempts}
              onToggleFlag={api.toggleFlag}
              onSetDateSolved={api.setDateSolved}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
