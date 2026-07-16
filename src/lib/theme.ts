import type { Theme } from '../data/types'

/** The OS-level color-scheme preference, defaulting to light when unknown. */
export function systemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Apply a theme to the document. Tailwind is configured with darkMode: 'class',
 * so toggling `dark` on <html> is the single switch for the whole palette; we
 * also keep the browser chrome (address bar) color in sync for polish.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#202124' : '#4285F4')
}
