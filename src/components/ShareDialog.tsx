import { useMemo, useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import type { ProblemProgress } from '../data/types'
import { buildSnapshot, snapshotUrl } from '../lib/share'
import { Modal } from './Modal'
import { ShareCard } from './ShareCard'

interface ShareDialogProps {
  progress: Record<string, ProblemProgress>
  onClose: () => void
}

/** Builds a read-only snapshot link + share card the user can copy or screenshot. */
export function ShareDialog({ progress, onClose }: ShareDialogProps) {
  const snapshot = useMemo(() => buildSnapshot(progress), [progress])
  const url = useMemo(() => snapshotUrl(snapshot), [snapshot])
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal
      title="Share your progress"
      onClose={onClose}
      icon={<Share2 size={18} className="text-google-blue" />}
    >
      <ShareCard progress={snapshot.progress} date={snapshot.date} />

      <label className="mt-4 block text-xs font-medium text-muted">
        Read-only snapshot link
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-google-blue px-3 py-2 text-xs font-medium text-white hover:opacity-90"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted">
        Anyone with this link sees a point-in-time snapshot of your solved
        problems — not your notes, and not a live view. It encodes the data in
        the link itself, so nothing is uploaded anywhere.
      </p>
    </Modal>
  )
}
