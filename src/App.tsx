import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, Share2, X } from 'lucide-react'
import type { CompanyId, Frequency, ListId } from './data/types'
import { applyTheme } from './lib/theme'
import { downloadStore, readFileText, sheetTSV } from './lib/backup'
import { validateImport } from './lib/storage'
import { daysSince } from './lib/dates'
import { decodeSnapshot, snapshotProgress, type Snapshot } from './lib/share'
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
import { useShortcuts } from './hooks/useShortcuts'
import { useAuth } from './hooks/useAuth'
import { useCloudSync } from './hooks/useCloudSync'
import { AuthButton } from './components/AuthButton'
import { isCloudEnabled } from './lib/supabase'
import { Header } from './components/Header'
import { ThemeToggle } from './components/ThemeToggle'
import { SettingsMenu } from './components/SettingsMenu'
import { Toast } from './components/Toast'
import { ShareDialog } from './components/ShareDialog'
import { SnapshotView } from './components/SnapshotView'
import { ShortcutsHelp } from './components/ShortcutsHelp'
import { ActivityLog } from './components/ActivityLog'
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

  // Accounts + cloud sync (no-ops when Supabase isn't configured).
  const auth = useAuth()
  useCloudSync(api, auth.user?.id ?? null)

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

  const doCopyForSheets = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sheetTSV(progress))
      showToast('Copied — paste into your Google Sheet.')
    } catch {
      showToast('Could not access the clipboard.')
    }
  }, [progress, showToast])

  const doImport = useCallback(
    async (file: File) => {
      try {
        const result = validateImport(JSON.parse(await readFileText(file)))
        if (!result.ok) {
          showToast(result.error)
          return
        }
        // Merge: add imported problems to existing data (imported wins on
        // conflict), keeping the current settings. Undo restores the prior store.
        const prev = api.store
        const added = Object.keys(result.store.progress).length
        api.replaceStore({
          ...prev,
          progress: { ...prev.progress, ...result.store.progress },
        })
        showToast(
          `Imported ${added} problem${added === 1 ? '' : 's'} (merged).`,
          () => api.replaceStore(prev),
        )
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

  const doRemoveAttempt = useCallback(
    (id: string, index: number) => {
      const prev = api.store
      api.removeAttempt(id, index)
      showToast('Attempt removed.', () => api.replaceStore(prev))
    },
    [api, showToast],
  )

  // ── Snapshot sharing: open the tracker as a read-only view from a link ─────
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [snapshotLoading, setSnapshotLoading] = useState(() =>
    window.location.hash.startsWith('#s='),
  )
  const [showShare, setShowShare] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [backupDismissed, setBackupDismissed] = useState(false)

  // Decoding a shared snapshot is async (decompression); load on mount + hashchange.
  useEffect(() => {
    let cancelled = false
    const load = () => {
      const hash = window.location.hash
      if (!hash.startsWith('#s=')) {
        setSnapshot(null)
        setSnapshotLoading(false)
        return
      }
      setSnapshotLoading(true)
      decodeSnapshot(hash).then((s) => {
        if (cancelled) return
        setSnapshot(s)
        setSnapshotLoading(false)
      })
    }
    load()
    window.addEventListener('hashchange', load)
    return () => {
      cancelled = true
      window.removeEventListener('hashchange', load)
    }
  }, [])

  const exitSnapshot = useCallback(() => {
    // Drop the hash without adding a history entry, then re-read.
    history.replaceState(null, '', window.location.pathname + window.location.search)
    setSnapshot(null)
  }, [])

  const importSnapshot = useCallback(
    (snap: Snapshot) => {
      const prev = api.store
      api.replaceStore({
        version: 1,
        progress: snapshotProgress(snap),
        settings: api.settings,
      })
      exitSnapshot()
      showToast('Snapshot imported into your tracker.', () =>
        api.replaceStore(prev),
      )
    },
    [api, exitSnapshot, showToast],
  )

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
      onToggleFlag: api.toggleFlag,
      onSetDateSolved: api.setDateSolved,
      onRemoveAttempt: doRemoveAttempt,
      onEditAttemptDate: api.editAttemptDate,
      onEditAttemptRating: api.editAttemptRating,
    }),
    [
      toggleExpand,
      api.setConfidence,
      api.clearRating,
      api.setNotes,
      api.toggleFlag,
      api.setDateSolved,
      doRemoveAttempt,
      api.editAttemptDate,
      api.editAttemptRating,
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

  // Open every solved problem's detail panel at once (and un-collapse sections).
  const expandAllSolved = useCallback(() => {
    setCollapsed(new Set())
    setExpanded(
      new Set(
        problems
          .filter((p) => progress[p.id]?.confidence != null)
          .map((p) => p.id),
      ),
    )
  }, [problems, progress])

  const collapseAll = useCallback(() => setExpanded(new Set()), [])

  // ── Global keyboard shortcuts (disabled behind a snapshot or open dialog) ──
  useShortcuts(
    {
      '/': (e) => {
        e.preventDefault()
        document.getElementById('search')?.focus()
      },
      '1': () => setTab('blind75'),
      '2': () => setTab('neetcode150'),
      '3': () => setTab('company'),
      d: toggleTheme,
      s: () => setShowShare(true),
      l: () => setShowLog(true),
      '?': () => setShowHelp(true),
    },
    !snapshot && !showShare && !showHelp && !showLog,
  )

  const label =
    tab === 'company' ? `${COMPANY_META[company].label} · Frequently asked` : LIST_LABELS[tab]

  // Nudge to back up when there's progress and it's been >7 days (or never).
  const daysSinceBackup = settings.lastBackup ? daysSince(settings.lastBackup) : Infinity
  const showBackupNudge =
    !backupDismissed &&
    Object.keys(progress).length > 0 &&
    daysSinceBackup >= 7

  // A snapshot link takes over the whole screen as a read-only view.
  if (snapshotLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-muted">
        Loading shared snapshot…
      </div>
    )
  }
  if (snapshot) {
    return (
      <SnapshotView
        snapshot={snapshot}
        onImport={() => importSnapshot(snapshot)}
        onExit={exitSnapshot}
      />
    )
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Header
          label={label}
          solved={solved}
          total={problems.length}
          right={
            <>
              {isCloudEnabled && <AuthButton auth={auth} />}
              <button
                type="button"
                onClick={() => setShowLog(true)}
                aria-label="Activity log"
                title="Activity log (l)"
                className="rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <CalendarDays size={18} />
              </button>
              <button
                type="button"
                onClick={() => setShowShare(true)}
                aria-label="Share progress"
                title="Share progress (s)"
                className="rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <Share2 size={18} />
              </button>
              <ThemeToggle theme={settings.theme} onToggle={toggleTheme} />
              <SettingsMenu
                dailyGoal={settings.dailyGoal}
                onSetDailyGoal={api.setDailyGoal}
                lastBackup={settings.lastBackup}
                onExport={doExport}
                onCopyForSheets={doCopyForSheets}
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

        {showBackupNudge && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-google-yellow/50 bg-google-yellow/10 px-4 py-3 text-sm">
            <AlertTriangle size={16} className="shrink-0 text-amber-600 dark:text-google-yellow" />
            <span className="text-ink">
              {settings.lastBackup
                ? `It's been ${daysSinceBackup} day${daysSinceBackup === 1 ? '' : 's'} since your last backup.`
                : `You haven't exported a backup yet.`}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={doExport}
                className="rounded-full bg-google-blue px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                Export now
              </button>
              <button
                type="button"
                onClick={doCopyForSheets}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
              >
                Copy for Sheets
              </button>
              <button
                type="button"
                onClick={() => setBackupDismissed(true)}
                aria-label="Dismiss"
                className="rounded-full p-1 text-muted hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        <DailySuggestions progress={progress} />

        <div className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-8">
          <aside className="mb-6 space-y-6 lg:sticky lg:top-8 lg:mb-0 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pr-1">
            <StatsRow
              progress={progress}
              dailyGoal={api.settings.dailyGoal}
              layout="stack"
            />
            <ReviewQueue progress={progress} onReview={api.markReviewedToday} />
            <Heatmap
              progress={progress}
              color={settings.heatmapColor}
              onColorChange={api.setHeatmapColor}
            />
          </aside>

          <main>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <TabBar active={tab} onChange={setTab} />
              <button
                type="button"
                onClick={expanded.size ? collapseAll : expandAllSolved}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                {expanded.size ? 'Collapse all' : 'Expand all solved'}
              </button>
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
          </main>
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          Press{' '}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="rounded border border-line px-1.5 py-0.5 font-medium text-muted transition-colors hover:text-ink"
          >
            ?
          </button>{' '}
          for keyboard shortcuts
        </p>
      </div>

      {showShare && (
        <ShareDialog progress={progress} onClose={() => setShowShare(false)} />
      )}

      {showLog && (
        <ActivityLog progress={progress} onClose={() => setShowLog(false)} />
      )}

      {showHelp && <ShortcutsHelp onClose={() => setShowHelp(false)} />}

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
