import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Lightbulb, X } from 'lucide-react'
import type { ProblemProgress } from '../data/types'
import { buildSuggestions, type SuggestionKind } from '../lib/suggestions'
import { cn } from '../lib/ui'

const ROTATE_MS = 9000

const KIND_DOT: Record<SuggestionKind, string> = {
  review: 'bg-google-blue',
  weak: 'bg-google-yellow',
  stretch: 'bg-google-green',
}

interface DailySuggestionsProps {
  progress: Record<string, ProblemProgress>
}

/**
 * A quiet, navigable rotating nudge — never a nag. One suggestion at a time,
 * arrow/swipe navigation, dots, auto-rotate that pauses on interaction, and a
 * dismiss button. Silent when there's nothing to suggest or reduced-motion is
 * requested (no auto-rotate).
 */
export function DailySuggestions({ progress }: DailySuggestionsProps) {
  const suggestions = useMemo(() => buildSuggestions(progress), [progress])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const touchX = useRef<number | null>(null)

  const count = suggestions.length
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Auto-rotate unless paused, reduced-motion, or there's only one.
  useEffect(() => {
    if (paused || reducedMotion || count <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS)
    return () => clearInterval(t)
  }, [paused, reducedMotion, count])

  if (dismissed || count === 0) return null

  const current = suggestions[index % count]
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count)

  return (
    <div
      className="mb-5 flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        touchX.current = null
      }}
      role="region"
      aria-label="Suggested problems"
              aria-roledescription="carousel"
    >
      <Lightbulb size={16} className="shrink-0 text-google-yellow" />

      {count > 1 && (
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous suggestion"
          className="shrink-0 rounded-full p-0.5 text-muted hover:text-ink"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <span
        className={cn('h-2 w-2 shrink-0 rounded-full', KIND_DOT[current.kind])}
        aria-hidden
      />

      <p className="min-w-0 flex-1 truncate text-muted" aria-live="polite">
        {current.reason}{' '}
        <a
          href={current.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-ink hover:text-google-blue hover:underline"
        >
          {current.name}
        </a>
      </p>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next suggestion"
            className="shrink-0 rounded-full p-0.5 text-muted hover:text-ink"
          >
            <ChevronRight size={16} />
          </button>
          <span className="hidden shrink-0 items-center gap-1 sm:flex">
            {suggestions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to suggestion ${i + 1}`}
                aria-current={i === index % count}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  i === index % count ? 'bg-google-blue' : 'bg-line',
                )}
              />
            ))}
          </span>
        </>
      )}

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss suggestions"
        className="shrink-0 rounded-full p-0.5 text-muted hover:text-google-red"
      >
        <X size={15} />
      </button>
    </div>
  )
}
