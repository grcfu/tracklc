import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  Confidence,
  ConfidencePoint,
  HeatmapColor,
  ProblemProgress,
  Store,
  Theme,
} from '../data/types'
import { todayISO } from '../lib/dates'
import { defaultStore, loadStore, saveStore, STORAGE_KEY } from '../lib/storage'

/** Immutably remove keys from an object (returns a new object). */
function omitKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const copy = { ...obj }
  for (const k of keys) delete copy[k]
  return copy
}

/**
 * Re-derive everything that is a function of the attempt log. `confidenceHistory`
 * is the source of truth: it stays date-sorted, its ends give the solve dates,
 * and the rating is the most recent *rated* attempt (some imported attempts are
 * unrated), falling back to the previous confidence. Callers must pass a
 * non-empty history — an emptied log un-solves the problem instead.
 */
function deriveFromHistory(
  prev: ProblemProgress,
  hist: ConfidencePoint[],
): ProblemProgress {
  const sorted = [...hist].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  )
  const lastRated = [...sorted].reverse().find((h) => h.value)?.value
  return {
    ...prev,
    confidence: lastRated ?? prev.confidence,
    dateSolved: sorted[0].date,
    lastReviewed: sorted[sorted.length - 1].date,
    confidenceHistory: sorted,
  }
}

/**
 * The single source of truth for user progress. Wraps localStorage with schema
 * versioning + try/catch, exposes granular mutations, and syncs across tabs.
 *
 * All mutations update immutably and preserve the object identity of untouched
 * problem entries, so memoized rows only re-render when their own data changes.
 * Derived values (progress %, streak, review queue) are NOT stored here — they
 * are computed with useMemo in the components that need them.
 */
export function useProgress() {
  const [store, setStore] = useState<Store>(loadStore)
  const [saveError, setSaveError] = useState<string | null>(null)

  const firstRender = useRef(true)
  const skipSave = useRef(false)

  // Persist on change (skip the initial mount and cross-tab-applied updates).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    const res = saveStore(store)
    setSaveError(res.ok ? null : res.error)
  }, [store])

  // Cross-tab sync: when another tab writes, re-read and apply without echoing
  // the write back out (skipSave guards the ping-pong).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== STORAGE_KEY) return
      skipSave.current = true
      setStore(loadStore())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /** Update a single problem's progress; deleting the entry if it ends empty. */
  const patchProblem = useCallback(
    (id: string, patch: (prev: ProblemProgress) => ProblemProgress) => {
      setStore((s) => {
        const prev = s.progress[id] ?? {}
        const next = patch(prev)
        const progress = { ...s.progress }
        if (Object.keys(next).length === 0) delete progress[id]
        else progress[id] = next
        return { ...s, progress }
      })
    },
    [],
  )

  // ── Problem mutations ───────────────────────────────────────────────────

  /** Rate a problem 1–5★. Rating a previously-unattempted problem solves it. */
  const setConfidence = useCallback(
    (id: string, value: Confidence) => {
      const today = todayISO()
      patchProblem(id, (prev) => {
        const history = prev.confidenceHistory ? [...prev.confidenceHistory] : []
        history.push({ date: today, value })
        return {
          ...prev,
          confidence: value,
          dateSolved: prev.dateSolved ?? today,
          lastReviewed: today,
          confidenceHistory: history,
        }
      })
    },
    [patchProblem],
  )

  /** Un-solve: strip the rating (keeps notes, attempts, flag, and history). */
  const clearRating = useCallback(
    (id: string) => {
      patchProblem(id, (prev) =>
        omitKeys(prev, ['confidence', 'dateSolved', 'lastReviewed']),
      )
    },
    [patchProblem],
  )

  /** Mark reviewed today; optionally update confidence at the same time. */
  const markReviewedToday = useCallback(
    (id: string, value?: Confidence) => {
      const today = todayISO()
      patchProblem(id, (prev) => {
        const history = prev.confidenceHistory ? [...prev.confidenceHistory] : []
        if (value) history.push({ date: today, value })
        return {
          ...prev,
          lastReviewed: today,
          ...(value ? { confidence: value } : {}),
          confidenceHistory: history,
        }
      })
    },
    [patchProblem],
  )

  /** Remove one attempt from the history, re-deriving solve dates + confidence. */
  const removeAttempt = useCallback(
    (id: string, index: number) => {
      patchProblem(id, (prev) => {
        const hist = (prev.confidenceHistory ?? []).slice()
        if (index < 0 || index >= hist.length) return prev
        hist.splice(index, 1)
        if (hist.length === 0) {
          // Last attempt gone → un-solve, but keep notes/attempts/flag.
          return omitKeys(prev, [
            'confidence',
            'dateSolved',
            'lastReviewed',
            'confidenceHistory',
          ])
        }
        return deriveFromHistory(prev, hist)
      })
    },
    [patchProblem],
  )

  /** Change the date of one logged attempt, re-sorting + re-deriving dates. */
  const editAttemptDate = useCallback(
    (id: string, index: number, newDate: string) => {
      if (!newDate) return
      patchProblem(id, (prev) => {
        const hist = (prev.confidenceHistory ?? []).slice()
        if (index < 0 || index >= hist.length) return prev
        hist[index] = { ...hist[index], date: newDate }
        return deriveFromHistory(prev, hist)
      })
    },
    [patchProblem],
  )

  /** Change one attempt's rating (0 = clear to unrated); re-derives confidence. */
  const editAttemptRating = useCallback(
    (id: string, index: number, value: Confidence | 0) => {
      patchProblem(id, (prev) => {
        const hist = (prev.confidenceHistory ?? []).slice()
        if (index < 0 || index >= hist.length) return prev
        hist[index] = { ...hist[index], value: value as Confidence }
        const lastRated = [...hist].reverse().find((h) => h.value)?.value
        return {
          ...prev,
          confidence: lastRated ?? prev.confidence,
          confidenceHistory: hist,
        }
      })
    },
    [patchProblem],
  )

  const setNotes = useCallback(
    (id: string, notes: string) => {
      patchProblem(id, (prev) =>
        notes.trim() ? { ...prev, notes } : omitKeys(prev, ['notes']),
      )
    },
    [patchProblem],
  )

  const toggleFlag = useCallback(
    (id: string) => {
      patchProblem(id, (prev) =>
        prev.flagged ? omitKeys(prev, ['flagged']) : { ...prev, flagged: true },
      )
    },
    [patchProblem],
  )

  /**
   * Edit the "first solved" date. The first solve *is* the earliest logged
   * attempt, so retarget that entry rather than writing `dateSolved` on its own
   * — otherwise the next attempt edit would re-derive the date and silently
   * throw this away. Moving it past a later attempt makes that one the first.
   */
  const setDateSolved = useCallback(
    (id: string, date: string) => {
      if (!date) return
      patchProblem(id, (prev) => {
        const hist = (prev.confidenceHistory ?? []).slice()
        if (hist.length === 0) return { ...prev, dateSolved: date }
        hist[0] = { ...hist[0], date }
        return deriveFromHistory(prev, hist)
      })
    },
    [patchProblem],
  )

  // ── Settings ──────────────────────────────────────────────────────────────

  const setTheme = useCallback((theme: Theme) => {
    setStore((s) => ({ ...s, settings: { ...s.settings, theme } }))
  }, [])

  const setHeatmapColor = useCallback((heatmapColor: HeatmapColor) => {
    setStore((s) => ({ ...s, settings: { ...s.settings, heatmapColor } }))
  }, [])

  const setDailyGoal = useCallback((n: number) => {
    setStore((s) => ({
      ...s,
      settings: { ...s.settings, dailyGoal: Math.max(1, Math.floor(n)) },
    }))
  }, [])

  const markBackedUp = useCallback(() => {
    setStore((s) => ({ ...s, settings: { ...s.settings, lastBackup: todayISO() } }))
  }, [])

  // ── Whole-store operations (import / reset / undo) ─────────────────────────

  /** Replace the entire store (used by Import and Undo). */
  const replaceStore = useCallback((next: Store) => {
    setStore(next)
  }, [])

  /** Reset all progress but keep settings. */
  const resetProgress = useCallback(() => {
    setStore((s) => ({ ...defaultStore(), settings: s.settings }))
  }, [])

  return {
    store,
    progress: store.progress,
    settings: store.settings,
    saveError,
    // problem mutations
    setConfidence,
    clearRating,
    markReviewedToday,
    removeAttempt,
    editAttemptDate,
    editAttemptRating,
    setNotes,
    toggleFlag,
    setDateSolved,
    // settings
    setTheme,
    setHeatmapColor,
    setDailyGoal,
    markBackedUp,
    // whole-store
    replaceStore,
    resetProgress,
  }
}

export type ProgressApi = ReturnType<typeof useProgress>
