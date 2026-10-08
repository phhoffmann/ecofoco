import { App } from '@capacitor/app'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { isMotionReduced } from '../data/motion'

// Matches the sheet-out / backdrop-out animations in index.css.
const CLOSE_MS = 200
const DRAG_DISMISS_PX = 80
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

interface BottomSheetProps {
  /** Called once the sheet has finished its closing animation. */
  onClose: () => void
  /** Id of the element that names the sheet, usually its heading. */
  labelledBy: string
  /** Receives `close`, which animates the sheet out before calling `onClose`. */
  children: (close: () => void) => ReactNode
}

/**
 * Modal sheet that slides up from the bottom. Dismissed by dragging the grip down, tapping the
 * backdrop, Escape, or the Android back button; keeps keyboard focus inside while open.
 */
export function BottomSheet({ onClose, labelledBy, children }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const dragStartY = useRef(0)
  const [closing, setClosing] = useState(false)
  const [dragY, setDragY] = useState<number | null>(null)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const close = useCallback(() => setClosing(true), [])

  // Let the slide-out animation play before the parent unmounts the sheet.
  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => onCloseRef.current(), isMotionReduced() ? 0 : CLOSE_MS)
    return () => window.clearTimeout(timer)
  }, [closing])

  // Move focus into the sheet, and give it back to whatever opened it.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    panelRef.current?.focus()
    return () => opener?.focus()
  }, [])

  // While a backButton listener exists Capacitor skips its default (leave the app), so only hold
  // one while the sheet is open.
  useEffect(() => {
    const listener = App.addListener('backButton', close)
    return () => {
      void listener.then((l) => l.remove())
    }
  }, [close])

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === panelRef.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (closing) return
    dragStartY.current = e.clientY
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragY(0)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (dragY === null || closing) return
    setDragY(Math.max(0, e.clientY - dragStartY.current))
  }

  function handlePointerUp() {
    if (dragY === null || closing) return
    // When dismissing, keep the dragged offset so the sheet slides out from where the finger left it.
    if (dragY > DRAG_DISMISS_PX) close()
    else setDragY(null)
  }

  const dragging = dragY !== null && !closing

  return createPortal(
    <div
      className="sheet-backdrop fixed inset-0 z-20 flex items-end justify-center bg-black/60"
      data-closing={closing || undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="sheet-panel flex max-h-[90svh] w-full max-w-md flex-col rounded-t-[2rem] bg-surface shadow-2xl ring-1 ring-line outline-none"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? 'none' : 'transform 200ms ease-out',
        }}
      >
        <div
          data-testid="sheet-grip"
          aria-hidden
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex h-8 shrink-0 cursor-grab touch-none items-center justify-center"
        >
          <span className="h-1.5 w-10 rounded-full bg-line" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-6 pb-[calc(1.5rem+var(--safe-bottom))]">{children(close)}</div>
      </div>
    </div>,
    document.body,
  )
}
