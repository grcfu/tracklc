import { LOGO_COLORS } from '../lib/ui'

const WORD = 'TrackLC'

/** The wordmark: each letter in a cycling Google color, like the Google logo. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight ${className}`}
      aria-label={WORD}
    >
      {WORD.split('').map((ch, i) => (
        <span key={i} style={{ color: LOGO_COLORS[i % LOGO_COLORS.length] }}>
          {ch}
        </span>
      ))}
    </span>
  )
}
