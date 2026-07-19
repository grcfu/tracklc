import { useEffect, useRef, useState } from 'react'
import { LogOut, User as UserIcon } from 'lucide-react'
import type { AuthApi } from '../hooks/useAuth'

/** Header control: "Sign in" when logged out, an account menu when logged in. */
export function AuthButton({ auth }: { auth: AuthApi }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  if (auth.loading) return null

  if (!auth.user) {
    return (
      <button
        type="button"
        onClick={auth.signInWithGoogle}
        className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
      >
        Sign in
      </button>
    )
  }

  const email = auth.user.email ?? 'Account'
  const initial = email[0]?.toUpperCase() ?? '?'

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        title={email}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-google-blue text-sm font-semibold text-white"
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 rounded-2xl border border-line bg-elevated p-2 shadow-cardHover animate-fade-in"
        >
          <div className="flex items-center gap-2 px-2 py-2 text-sm">
            <UserIcon size={16} className="shrink-0 text-muted" />
            <span className="truncate text-ink">{email}</span>
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            onClick={() => {
              auth.signOut()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-google-red transition-colors hover:bg-google-red/10"
          >
            <LogOut size={16} /> Sign out
          </button>
          <p className="px-2 pt-1 text-[11px] text-muted">
            Your progress is synced to this account.
          </p>
        </div>
      )}
    </div>
  )
}
