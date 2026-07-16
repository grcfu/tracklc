import type { Confidence, ProblemProgress } from '../data/types'
import { todayISO } from './dates'

/**
 * A point-in-time, read-only export of progress, small enough to live entirely
 * in a URL hash — no backend involved. Only the fields needed to render stats
 * and a solved list are included; notes, attempts, and flags are intentionally
 * left out so sharing never leaks personal annotations.
 */
export interface Snapshot {
  v: 1
  /** Date the snapshot was created (YYYY-MM-DD). */
  date: string
  progress: Record<string, SnapshotEntry>
}

interface SnapshotEntry {
  confidence: Confidence
  dateSolved?: string
  lastReviewed?: string
}

const HASH_PREFIX = '#s='

// ── UTF-8 safe base64url (works for any characters, chunked for large input) ──

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToUtf8(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/** Build a snapshot from a live progress map (solved problems only). */
export function buildSnapshot(
  progress: Record<string, ProblemProgress>,
): Snapshot {
  const trimmed: Record<string, SnapshotEntry> = {}
  for (const [id, p] of Object.entries(progress)) {
    if (!p.confidence) continue
    trimmed[id] = {
      confidence: p.confidence,
      dateSolved: p.dateSolved,
      lastReviewed: p.lastReviewed,
    }
  }
  return { v: 1, date: todayISO(), progress: trimmed }
}

/** Encode a snapshot into a shareable absolute URL. */
export function snapshotUrl(snapshot: Snapshot): string {
  const encoded = utf8ToBase64Url(JSON.stringify(snapshot))
  const { origin, pathname } = window.location
  return `${origin}${pathname}${HASH_PREFIX}${encoded}`
}

/**
 * Decode a snapshot from a location hash (e.g. "#s=…"). Returns null when the
 * hash isn't a snapshot or can't be parsed into the expected shape.
 */
export function decodeSnapshot(hash: string): Snapshot | null {
  if (!hash.startsWith(HASH_PREFIX)) return null
  try {
    const raw = JSON.parse(base64UrlToUtf8(hash.slice(HASH_PREFIX.length)))
    if (
      raw &&
      typeof raw === 'object' &&
      raw.v === 1 &&
      typeof raw.date === 'string' &&
      raw.progress &&
      typeof raw.progress === 'object'
    ) {
      return raw as Snapshot
    }
  } catch {
    /* fall through */
  }
  return null
}

/** Snapshot entries are already valid ProblemProgress — widen the type. */
export function snapshotProgress(
  snapshot: Snapshot,
): Record<string, ProblemProgress> {
  return snapshot.progress
}
