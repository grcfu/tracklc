import { useState } from 'react'
import { Star } from 'lucide-react'
import type { Confidence } from '../data/types'
import { clamp, cn, CONFIDENCE_COLOR } from '../lib/ui'

interface StarRatingProps {
  /** Current rating, or 0 when unattempted. */
  value: Confidence | 0
  onChange?: (v: Confidence) => void
  size?: number
  readOnly?: boolean
  label?: string
}

/**
 * 1–5 star rating that doubles as solved-status: a filled star = solved with
 * that confidence, no stars = unattempted. Implemented as a radiogroup with
 * roving tabindex so it's a single tab stop and arrow keys adjust it.
 */
export function StarRating({
  value,
  onChange,
  size = 18,
  readOnly = false,
  label = 'Confidence rating',
}: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const display = hover || value
  const active = value || 1
  const interactive = !readOnly && !!onChange
  const fillColor = display > 0 ? CONFIDENCE_COLOR[display as Confidence] : undefined

  const move = (e: React.KeyboardEvent, star: number) => {
    if (!interactive) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange!(clamp(star + 1, 1, 5) as Confidence)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange!(clamp(star - 1, 1, 5) as Confidence)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            tabIndex={interactive ? (star === active ? 0 : -1) : -1}
            disabled={!interactive}
            onClick={(e) => {
              e.stopPropagation()
              onChange?.(star as Confidence)
            }}
            onMouseEnter={() => interactive && setHover(star)}
            onKeyDown={(e) => move(e, star)}
            className={cn(
              'rounded p-0.5 transition-transform',
              interactive && 'cursor-pointer hover:scale-110',
            )}
          >
            <Star
              size={size}
              strokeWidth={2}
              className={cn('transition-colors', !filled && 'fill-transparent text-line')}
              style={filled ? { color: fillColor, fill: fillColor } : undefined}
            />
          </button>
        )
      })}
    </div>
  )
}
