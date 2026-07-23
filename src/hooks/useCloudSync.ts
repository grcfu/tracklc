import { useEffect, useRef } from 'react'
import type { ProblemProgress, Store } from '../data/types'
import type { ProgressApi } from './useProgress'
import { STORES_TABLE, supabase } from '../lib/supabase'

type ProgressMap = Record<string, ProblemProgress>

/** "Richness" of a problem entry — more logged attempts, then more recent. */
function score(p: ProblemProgress): [number, string] {
  return [p.confidenceHistory?.length ?? 0, p.lastReviewed ?? p.dateSolved ?? '']
}

/**
 * Union two progress maps, never dropping a problem. For a problem present in
 * both, keep the "richer" entry (more attempts logged, then more recent), so a
 * stale or empty copy can never erase real data.
 */
function mergeProgress(a: ProgressMap, b: ProgressMap): ProgressMap {
  const out: ProgressMap = { ...a }
  for (const [id, bp] of Object.entries(b)) {
    const ap = out[id]
    if (!ap) {
      out[id] = bp
      continue
    }
    const [al, ar] = score(ap)
    const [bl, br] = score(bp)
    if (bl > al || (bl === al && br > ar)) out[id] = bp
  }
  return out
}

/**
 * Sync the local store with the signed-in user's cloud row:
 *  - on sign-in, MERGE cloud + local (union, richer wins) and push the result
 *    back up, so nothing is ever lost in either direction,
 *  - then auto-save (debounced) whenever the local store changes.
 *
 * No-ops when Supabase isn't configured or nobody is signed in, so the app
 * stays fully local and offline-capable; localStorage remains the live cache.
 */
export function useCloudSync(api: ProgressApi, userId: string | null) {
  const apiRef = useRef(api)
  apiRef.current = api
  const loadedFor = useRef<string | null>(null)

  const save = async (userId: string, store: Store) => {
    const { error } = await supabase!
      .from(STORES_TABLE)
      .upsert({
        user_id: userId,
        data: store,
        updated_at: new Date().toISOString(),
      })
    if (error) console.warn('[cloud] save failed:', error.message)
  }

  useEffect(() => {
    if (!supabase || !userId) {
      loadedFor.current = null
      return
    }
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from(STORES_TABLE)
        .select('data')
        .eq('user_id', userId)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        console.warn('[cloud] load failed:', error.message)
        return // keep local as-is; don't risk clobbering it
      }
      const local = apiRef.current.store
      const cloud = data?.data as Store | undefined
      // Merge (union) so neither side loses data, keeping local settings.
      const merged: Store = cloud
        ? { ...local, progress: mergeProgress(local.progress, cloud.progress) }
        : local
      apiRef.current.replaceStore(merged)
      await save(userId, merged) // converge the cloud to the merged result
      loadedFor.current = userId
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!supabase || !userId || loadedFor.current !== userId) return
    const t = window.setTimeout(() => {
      void save(userId, apiRef.current.store)
    }, 800)
    return () => window.clearTimeout(t)
  }, [api.store, userId])
}
