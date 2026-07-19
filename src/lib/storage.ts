import type { Store } from '../data/types'

export const STORAGE_KEY = 'lc-tracker-v1'
export const SCHEMA_VERSION = 1 as const

/** A fresh, empty store. First-time visitors start in dark mode. */
export function defaultStore(): Store {
  return {
    version: SCHEMA_VERSION,
    progress: {},
    settings: { theme: 'dark', dailyGoal: 3, heatmapColor: 'green' },
  }
}

/**
 * Migrate an unknown-but-parsed object toward the current schema. Kept as a
 * single seam so future version bumps have an obvious home. Returns null if
 * the object can't be understood at all.
 */
function migrate(raw: unknown): Store | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  // Currently only v1 exists. Unknown/newer versions are treated as v1-shaped
  // and defensively normalized rather than rejected outright.
  const base = defaultStore()
  const progress =
    obj.progress && typeof obj.progress === 'object'
      ? (obj.progress as Store['progress'])
      : base.progress
  const settings =
    obj.settings && typeof obj.settings === 'object'
      ? { ...base.settings, ...(obj.settings as Partial<Store['settings']>) }
      : base.settings

  return { version: SCHEMA_VERSION, progress, settings }
}

/** Load the store from localStorage, falling back to a fresh store on any error. */
export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStore()
    const migrated = migrate(JSON.parse(raw))
    return migrated ?? defaultStore()
  } catch (err) {
    console.warn('[storage] failed to load, using fresh store:', err)
    return defaultStore()
  }
}

export type SaveResult = { ok: true } | { ok: false; error: string }

/** Persist the store. Never throws — surfaces failures as a result. */
export function saveStore(store: Store): SaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    return { ok: true }
  } catch (err) {
    console.warn('[storage] failed to save:', err)
    return {
      ok: false,
      error:
        err instanceof Error && err.name === 'QuotaExceededError'
          ? 'Storage is full — your latest change may not have been saved.'
          : 'Could not save to this browser. Your latest change may be lost.',
    }
  }
}

export type ImportResult =
  | { ok: true; store: Store }
  | { ok: false; error: string }

/**
 * Validate an imported blob before it's allowed to overwrite existing data.
 * Checks the top-level shape and version so a malformed file can't corrupt
 * the store.
 */
export function validateImport(raw: unknown): ImportResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'File is not a valid backup (expected an object).' }
  }
  const obj = raw as Record<string, unknown>
  if (obj.version !== SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Unsupported backup version (got ${String(
        obj.version,
      )}, expected ${SCHEMA_VERSION}).`,
    }
  }
  if (!obj.progress || typeof obj.progress !== 'object') {
    return { ok: false, error: 'Backup is missing its "progress" data.' }
  }
  const migrated = migrate(obj)
  if (!migrated) return { ok: false, error: 'Backup could not be read.' }
  return { ok: true, store: migrated }
}
