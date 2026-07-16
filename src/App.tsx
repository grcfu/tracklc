import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { CompanyId, Frequency, ListId } from './data/types'
import { applyTheme } from './lib/theme'
import { downloadStore, readFileText } from './lib/backup'
import { validateImport } from './lib/storage'
import {
  companyProblems,
  groupByCategory,
  groupByFrequency,
  listProblems,
  LIST_LABELS,
} from './data/lists'
import { COMPANY_META } from './data/companies'
import {
  DEFAULT_FILTERS,
  isFiltering,
  matchesFilters,
  sortProblems,
  type FilterState,
} from './lib/filters'
import { useProgress } from './hooks/useProgress'
import { Header } from './components/Header'
import { ThemeToggle } from './components/ThemeToggle'
import { SettingsMenu } from './components/SettingsMenu'
import { Toast } from './components/Toast'
import { DailySuggestions } from './components/DailySuggestions'
import { StatsRow } from './components/StatsRow'
import { ReviewQueue } from './components/ReviewQueue'
import { Heatmap } from './components/Heatmap'
import { TabBar } from './components/TabBar'
import { CategorySection } from './components/CategorySection'
import { CompanyBar, type CompanyGrouping } from './components/CompanyBar'
import { FilterBar } from './components/FilterBar'
import type { RowHandlers } from './components/ProblemRow'

export default function App() {
  const api = useProgress()
  const { progress, settings } = api

  // Keep the document theme in sync with the stored preference.
  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  const toggleTheme = useCallback(() => {
    api.setTheme(settings.theme === 'dark' ? 'light' : 'dark')
  }, [api, settings.theme])

  // ── Data management: export / import / reset, each with an undo toast ──────
  const [toast, setToast] = useState<{
    message: string
    undo?: () => void
  } | null>(null)

  const showToast = useCallback((message: string, undo?: () => void) => {
    setToast({ message, undo })
  }, [])

  const doExport = useCallback(() => {
    downloadStore(api.store)
    api.markBackedUp()
    showToast('Backup downloaded.')
  }, [api, showToast])

  const doImport = useCallback(
    async (file: File) => {
      try {
        const result = validateImport(JSON.parse(await readFileText(file)))
        if (!result.ok) {
          showToast(result.error)
          return
        }
        const prev = api.store
        api.replaceStore(result.store)
        showToast('Progress imported.', () => api.replaceStore(prev))
      } catch {
        showToast('That file could not be read as JSON.')
      }
    },
    [api, showToast],
  )

  const doReset = useCallback(() => {
    const prev = api.store
    api.resetProgress()
    showToast('Progress reset.', () => api.replaceStore(prev))
  }, [api, showToast])

  const [tab, setTab] = useState<ListId>('blind75')
  const [company, setCompany] = useState<CompanyId>('google')
  const [companyGrouping, setCompanyGrouping] =
    useState<CompanyGrouping>('frequency')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const updateFilters = useCallback(
    (patch: Partial<FilterState>) => setFilters((f) => ({ ...f, ...patch })),
    [],
  )
  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleCollapse = useCallback((title: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }, [])

  const handlers = useMemo<RowHandlers>(
    () => ({
      onToggleExpand: toggleExpand,
      onSetConfidence: api.setConfidence,
      onClearRating: api.clearRating,
      onSetNotes: api.setNotes,
      onSetAttempts: api.setAttempts,
      onToggleFlag: api.toggleFlag,
      onSetDateSolved: api.setDateSolved,
    }),
    [
      toggleExpand,
      api.setConfidence,
      api.clearRating,
      api.setNotes,
      api.setAttempts,
      api.toggleFlag,
      api.setDateSolved,
    ],
  )

  const problems = useMemo(
    () => listProblems(tab, company),
    [tab, company],
  )

  const groups = useMemo(() => {
    const match = (p: (typeof problems)[number]) =>
      matchesFilters(p, progress[p.id], filters)

    // A non-default sort flattens everything into one ranked "Results" group.
    if (filters.sort !== 'default') {
      const flat = sortProblems(problems.filter(match), progress, filters.sort)
      return flat.length ? [{ key: `Results (${flat.length})`, problems: flat }] : []
    }

    if (tab === 'company') {
      const cps = companyProblems(company).filter((cp) =>
        matchesFilters(cp.problem, progress[cp.problem.id], filters),
      )
      return companyGrouping === 'frequency'
        ? groupByFrequency(cps)
        : groupByCategory(cps.map((c) => c.problem))
    }
    return groupByCategory(problems.filter(match))
  }, [tab, company, companyGrouping, problems, filters, progress])

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
        <Header
          label={label}
          solved={solved}
          total={problems.length}
          right={
            <>
              <ThemeToggle theme={settings.theme} onToggle={toggleTheme} />
              <SettingsMenu
                dailyGoal={settings.dailyGoal}
                onSetDailyGoal={api.setDailyGoal}
                lastBackup={settings.lastBackup}
                onExport={doExport}
                onImport={doImport}
                onReset={doReset}
              />
            </>
          }
        />

        {api.saveError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2 rounded-xl border border-google-red/40 bg-google-red/10 px-4 py-3 text-sm text-google-red"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{api.saveError}</span>
          </div>
        )}

        <DailySuggestions progress={progress} />
        <StatsRow progress={progress} dailyGoal={api.settings.dailyGoal} />
        <ReviewQueue progress={progress} onReview={api.markReviewedToday} />
        <Heatmap progress={progress} />

        <div className="mb-6">
          <TabBar active={tab} onChange={setTab} />
        </div>

        {tab === 'company' && (
          <CompanyBar
            company={company}
            onCompanyChange={setCompany}
            grouping={companyGrouping}
            onGroupingChange={setCompanyGrouping}
          />
        )}

        <FilterBar
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
        />

        {groups.length > 0 ? (
          <div>
            {groups.map((group) => (
              <CategorySection
                key={group.key}
                title={group.key}
                problems={group.problems}
                progress={progress}
                frequencyOf={frequencyOf}
                collapsed={collapsed.has(group.key)}
                onToggleCollapse={toggleCollapse}
                expandedRows={expanded}
                handlers={handlers}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-display font-semibold text-ink">No matches</p>
            <p className="mt-1 text-sm text-muted">
              No problems match your current search and filters.
            </p>
            {isFiltering(filters) && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-full bg-google-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.undo}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
