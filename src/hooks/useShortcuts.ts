import { useEffect, useRef } from 'react'

type ShortcutMap = Record<string, (e: KeyboardEvent) => void>

/** True when focus is in a field where keystrokes should be left alone. */
function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  )
}

/**
 * Bind single-key global shortcuts. Handlers are keyed by KeyboardEvent.key.
 * Keys are ignored while the user is typing in a field or holding a modifier,
 * so app shortcuts never fight with the browser or with text entry. The handler
 * map is read through a ref, so passing a fresh object each render is fine and
 * the window listener is only attached once.
 */
export function useShortcuts(handlers: ShortcutMap, enabled = true): void {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      const handler = ref.current[e.key]
      if (handler) handler(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
