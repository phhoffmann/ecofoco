import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BottomSheet } from './BottomSheet'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { backButtonListeners, removeListener } = vi.hoisted(() => ({
  backButtonListeners: [] as Array<() => void>,
  removeListener: vi.fn(),
}))
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: (_event: 'backButton', cb: () => void) => {
      backButtonListeners.push(cb)
      return Promise.resolve({
        remove: () => {
          removeListener()
          backButtonListeners.splice(backButtonListeners.indexOf(cb), 1)
        },
      })
    },
  },
}))

describe('BottomSheet', () => {
  let container: HTMLDivElement
  let root: Root
  let opener: HTMLButtonElement
  let onClose: ReturnType<typeof vi.fn<() => void>>

  beforeEach(() => {
    vi.useFakeTimers()
    backButtonListeners.length = 0
    removeListener.mockClear()
    onClose = vi.fn<() => void>()
    opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() =>
      root.render(
        <BottomSheet onClose={onClose} labelledBy="sheet-title">
          {(close) => (
            <>
              <h2 id="sheet-title">Title</h2>
              <button data-testid="first">First</button>
              <button data-testid="last" onClick={close}>
                Close
              </button>
            </>
          )}
        </BottomSheet>,
      ),
    )
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    opener.remove()
    vi.useRealTimers()
  })

  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')!
  const backdrop = () => dialog().parentElement!
  const byTestId = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!

  function finishClosing() {
    act(() => vi.advanceTimersByTime(250))
  }

  function key(target: HTMLElement, init: KeyboardEventInit) {
    act(() => {
      target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }))
    })
  }

  function drag(fromY: number, toY: number) {
    const grip = byTestId('sheet-grip')
    act(() => {
      grip.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientY: fromY }))
    })
    act(() => {
      grip.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientY: toY }))
    })
    act(() => {
      grip.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientY: toY }))
    })
  }

  it('opens as a labelled modal dialog with focus inside it', () => {
    expect(dialog().getAttribute('aria-modal')).toBe('true')
    expect(dialog().getAttribute('aria-labelledby')).toBe('sheet-title')
    expect(dialog().contains(document.activeElement)).toBe(true)
  })

  it('closes after its slide-out when the backdrop is tapped, then returns focus to the opener', () => {
    act(() => backdrop().click())
    expect(backdrop().hasAttribute('data-closing')).toBe(true)
    expect(onClose).not.toHaveBeenCalled()

    finishClosing()
    expect(onClose).toHaveBeenCalledOnce()

    act(() => root.render(<></>))
    expect(document.activeElement).toBe(opener)
  })

  it('does not close when tapping inside the sheet', () => {
    act(() => byTestId('first').click())
    finishClosing()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes from the close callback given to its children', () => {
    act(() => byTestId('last').click())
    finishClosing()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on Escape', () => {
    key(dialog(), { key: 'Escape' })
    finishClosing()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on the Android back button and releases the listener on unmount', async () => {
    expect(backButtonListeners).toHaveLength(1)
    act(() => backButtonListeners[0]())
    finishClosing()
    expect(onClose).toHaveBeenCalledOnce()

    await act(async () => root.render(<></>))
    expect(removeListener).toHaveBeenCalled()
  })

  it('closes when dragged down past the threshold', () => {
    drag(100, 300)
    finishClosing()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('snaps back when dragged only a little', () => {
    drag(100, 130)
    finishClosing()
    expect(onClose).not.toHaveBeenCalled()
    expect(dialog().style.transform).toBe('')
  })

  it('traps Tab focus inside the sheet', () => {
    byTestId('last').focus()
    key(byTestId('last'), { key: 'Tab' })
    expect(document.activeElement).toBe(byTestId('first'))

    key(byTestId('first'), { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(byTestId('last'))
  })
})
