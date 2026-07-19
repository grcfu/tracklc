import { useEffect, useRef } from 'react'
import type { Store } from '../data/types'
import type { ProgressApi } from './useProgress'
import { STORES_TABLE, supabase } from '../lib/supabase'

/**
 * Sync the local store with the signed-in user's cloud row:
 *  - on sign-in, adopt the cloud copy (or seed it from local on first login),
 *  - then auto-save (debounced) whenever the local store changes.
 *
 * No-ops when Supabase isn't configured or nobody is signed in, so the app
 * stays fully local and offline-capable; localStorage remains the live cache.
 */
export function useCloudSync(api: ProgressApi, userId: string | null) {
  const apiRef = useRef(api)
  apiRef.current = api
  // Tracks the user we've completed the initial load for, so the save effect
  // doesn't fire before we've pulled the cloud copy down.
  const loadedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!supabase || !userId) {
      loadedFor.current = null
      return
    }
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from(STORES_TABLE)
        .select('data')
        .eq('user_id', userId)
        .maybeSingle()
      if (cancelled) return
      if (data?.data) {
        apiRef.current.replaceStore(data.data as Store) // cloud wins on login
      } else {
        // First login on this account — seed the cloud from whatever's local.
        await supabase.from(STORES_TABLE).upsert({
          user_id: userId,
          data: apiRef.current.store,
          updated_at: new Date().toISOString(),
        })
      }
      loadedFor.current = userId
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!supabase || !userId || loadedFor.current !== userId) return
    const t = window.setTimeout(() => {
      void supabase!
        .from(STORES_TABLE)
        .upsert({
          user_id: userId,
          data: apiRef.current.store,
          updated_at: new Date().toISOString(),
        })
    }, 800)
    return () => window.clearTimeout(t)
  }, [api.store, userId])
}
