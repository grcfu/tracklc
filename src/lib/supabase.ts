import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * The Supabase client — created only when both env vars are present. When
 * they're absent (e.g. no backend configured yet), this is null and the whole
 * app runs exactly as before: fully local, no accounts, no network calls.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

/** True when accounts/cloud sync are available. */
export const isCloudEnabled = supabase !== null

/** The table holding one progress blob per user. */
export const STORES_TABLE = 'tracklc_stores'
