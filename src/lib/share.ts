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

// ── base64url over raw bytes ─────────────────────────────────────────────────

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** Legacy decoder for pre-compression links (plain-JSON base64url). */
function base64UrlToUtf8(b64url: string): string {
  return new TextDecoder().decode(base64UrlToBytes(b64url))
}

// ── deflate / inflate via the browser's built-in CompressionStream ───────────

async function deflate(str: string): Promise<Uint8Array> {
  const stream = new Blob([str])
    .stream()
    .pipeThrough(new CompressionStream('deflate'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function inflate(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate'))
  return new Response(stream).text()
}

function isSnapshot(raw: unknown): raw is Snapshot {
  const s = raw as Snapshot
  return (
    !!s &&
    typeof s === 'object' &&
    s.v === 1 &&
    typeof s.date === 'string' &&
    !!s.progress &&
    typeof s.progress === 'object'
  )
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

/** Encode a snapshot into a compressed, shareable absolute URL. */
export async function snapshotUrl(snapshot: Snapshot): Promise<string> {
  const bytes = await deflate(JSON.stringify(snapshot))
  const { origin, pathname } = window.location
  return `${origin}${pathname}${HASH_PREFIX}${bytesToBase64Url(bytes)}`
}

/**
 * Decode a snapshot from a location hash ("#s=…"). Tries the compressed format
 * first, then the legacy plain-JSON format. Returns null on any failure.
 */
export async function decodeSnapshot(hash: string): Promise<Snapshot | null> {
  if (!hash.startsWith(HASH_PREFIX)) return null
  const payload = hash.slice(HASH_PREFIX.length)
  // Current format: deflate-compressed JSON.
  try {
    const raw = JSON.parse(await inflate(base64UrlToBytes(payload)))
    if (isSnapshot(raw)) return raw
  } catch {
    /* try legacy */
  }
  // Legacy format: plain-JSON base64url (pre-compression links).
  try {
    const raw = JSON.parse(base64UrlToUtf8(payload))
    if (isSnapshot(raw)) return raw
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
