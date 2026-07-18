import type { ProblemProgress, Store } from '../data/types'
import { NEETCODE150 } from '../data/neetcode150'
import { todayISO } from './dates'

/** ISO date (YYYY-MM-DD) → "M/D" to match the Google Sheet's date style. */
function toSheetDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${m}/${d}`
}

/**
 * Tab-separated rows mirroring the Google Sheet layout
 * (Name, Category, Difficulty, Dates, Rating, Notes) for every solved problem,
 * in NeetCode 150 order. Paste straight into a sheet as a human-readable backup.
 */
export function sheetTSV(progress: Record<string, ProblemProgress>): string {
  const rows: string[] = []
  for (const prob of NEETCODE150) {
    const p = progress[prob.id]
    if (!p?.confidence) continue
    const dates = (p.confidenceHistory ?? []).map((h) => toSheetDate(h.date))
    if (!dates.length && p.dateSolved) dates.push(toSheetDate(p.dateSolved))
    const notes = (p.notes ?? '').replace(/[\t\n]+/g, ' ')
    rows.push(
      [
        prob.name,
        prob.category,
        prob.difficulty,
        dates.join(', '),
        String(p.confidence),
        notes,
      ].join('\t'),
    )
  }
  return rows.join('\n')
}

/** Filename for an exported backup, dated so backups sort chronologically. */
export function backupFilename(): string {
  return `tracklc-backup-${todayISO()}.json`
}

/** Trigger a client-side download of the store as pretty-printed JSON. */
export function downloadStore(store: Store): void {
  const blob = new Blob([JSON.stringify(store, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = backupFilename()
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Read a File's text contents (Promise wrapper around FileReader). */
export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () =>
      reject(reader.error ?? new Error('Could not read file'))
    reader.readAsText(file)
  })
}
