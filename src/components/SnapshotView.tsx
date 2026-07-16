import { useMemo } from 'react'
import { ArrowLeft, Download, ExternalLink, Eye } from 'lucide-react'
import type { Difficulty } from '../data/types'
import type { Snapshot } from '../lib/share'
import { getProblem } from '../data/catalog'
import { formatDate } from '../lib/dates'
import { StarRating } from './StarRating'
import { ShareCard } from './ShareCard'
import { cn, DIFFICULTY_BADGE, DIFFICULTY_ORDER } from '../lib/ui'

interface SnapshotViewProps {
  snapshot: Snapshot
  /** Overwrite the viewer's own tracker with this snapshot (with undo). */
  onImport: () => void
  /** Leave the snapshot and return to the viewer's own tracker. */
  onExit: () => void
}

interface SolvedItem {
  id: string
  name: string
  link: string
  difficulty: Difficulty
  confidence: 1 | 2 | 3 | 4 | 5
}

/**
 * Full-page, read-only rendering of a shared snapshot. Nothing here mutates the
 * viewer's data — the only writes are the explicit "Use as my data" import.
 */
export function SnapshotView({ snapshot, onImport, onExit }: SnapshotViewProps) {
  const items = useMemo<SolvedItem[]>(() => {
    const rows: SolvedItem[] = []
    for (const [id, entry] of Object.entries(snapshot.progress)) {
      const problem = getProblem(id)
      if (!problem) continue
      rows.push({
        id,
        name: problem.name,
        link: problem.link,
        difficulty: problem.difficulty,
        confidence: entry.confidence,
      })
    }
    const order = (d: Difficulty) => DIFFICULTY_ORDER.indexOf(d)
    return rows.sort(
      (a, b) => order(a.difficulty) - order(b.difficulty) || a.name.localeCompare(b.name),
    )
  }, [snapshot])

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-google-blue/30 bg-google-blue/10 px-4 py-3 text-sm text-google-blue">
          <Eye size={16} className="shrink-0" />
          <span>
            Read-only shared snapshot from {formatDate(snapshot.date)}. Nothing
            you do here changes the sharer's data.
          </span>
        </div>

        <ShareCard progress={snapshot.progress} date={snapshot.date} />

        <div className="mt-6 mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
          >
            <ArrowLeft size={15} /> Back to my tracker
          </button>
          <button
            type="button"
            onClick={onImport}
            className="inline-flex items-center gap-1.5 rounded-full bg-google-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Download size={15} /> Use as my data
          </button>
        </div>

        <p className="mb-4 text-sm text-muted">
          {items.length} solved {items.length === 1 ? 'problem' : 'problems'}
        </p>

        <ul className="space-y-1.5">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5"
            >
              <a
                href={it.link}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex min-w-0 flex-1 items-center gap-1.5 text-sm font-medium text-ink hover:text-google-blue"
              >
                <span className="truncate">{it.name}</span>
                <ExternalLink
                  size={12}
                  className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                />
              </a>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  DIFFICULTY_BADGE[it.difficulty],
                )}
              >
                {it.difficulty}
              </span>
              <StarRating value={it.confidence} readOnly size={16} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
