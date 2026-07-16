import type { Store } from '../data/types'
import { todayISO } from './dates'

/** Filename for an exported backup, dated so backups sort chronologically. */
export function backupFilename(): string {
  return `leettrack-backup-${todayISO()}.json`
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
