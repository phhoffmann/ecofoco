import { App } from '@capacitor/app'
import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Shared behaviour of a modal dialog, for as long as it is mounted: focus moves into it (to
 * `initialFocus`, or the container) and returns to whatever opened it, unless another dialog has
 * taken it meanwhile; Escape and the Android back button call `onDismiss`; Tab stays inside. Spread
 * the returned handler as the container's onKeyDown.
 */
export function useModal(
  container: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  initialFocus?: RefObject<HTMLElement | null>,
): (e: KeyboardEvent<HTMLElement>) => void {
  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = container.current
    ;(initialFocus?.current ?? root)?.focus()
    return () => {
      const active = document.activeElement
      if (!active || active === document.body || root?.contains(active)) opener?.focus()
    }
    // Refs are stable, so this runs once: focus moves in on mount and back out on unmount.
  }, [container, initialFocus])

  // While a backButton listener exists Capacitor skips its default (leave the app), so only hold
  // one while the dialog is open.
  useEffect(() => {
    const listener = App.addListener('backButton', () => onDismissRef.current())
    return () => {
      void listener.then((l) => l.remove())
    }
  }, [])

  return (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onDismissRef.current()
      return
    }
    const root = container.current
    if (e.key !== 'Tab' || !root) return
    const focusable = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === root)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
