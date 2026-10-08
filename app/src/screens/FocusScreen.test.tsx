import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { HOLD_TO_CONFIRM_MS } from '../components/ui'
import { useFocusSessionStore } from '../stores/focusSessionStore'
import { FocusScreen } from './FocusScreen'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('../data/appLifecycle', () => ({
  onAppStateChange: () => () => {},
  canTellScreenOffFromAppSwitch: () => true,
  timeInOtherAppsMs: async () => 0,
}))
vi.mock('../data/focusSessionRepo', () => ({}))
vi.mock('../data/collectionRepo', () => ({}))

describe('FocusScreen', () => {
  let container: HTMLDivElement
  let root: Root
  const fail = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    fail.mockReset().mockResolvedValue(undefined)
    useFocusSessionStore.setState({
      status: 'running',
      plannedDurationSeconds: 1500,
      remainingSeconds: 1450,
      growingArchetype: 'palm',
      resultSpecies: null,
      failReason: null,
      fail,
    })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<FocusScreen />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.useRealTimers()
  })

  const giveUp = () => [...container.querySelectorAll('button')].find((b) => b.textContent === 'Hold to give up')!
  const press = (el: Element, type: string) => act(() => el.dispatchEvent(new MouseEvent(type, { bubbles: true })))

  it('gives up only after Give up is held for the full time, recording it as giving up', () => {
    press(giveUp(), 'pointerdown')
    act(() => vi.advanceTimersByTime(HOLD_TO_CONFIRM_MS - 1))
    expect(fail).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(fail).toHaveBeenCalledExactlyOnceWith('gave_up')
  })

  it('does nothing on a tap or a hold released early', () => {
    act(() => giveUp().click())
    press(giveUp(), 'pointerdown')
    act(() => vi.advanceTimersByTime(HOLD_TO_CONFIRM_MS / 2))
    press(giveUp(), 'pointerup')
    act(() => vi.advanceTimersByTime(HOLD_TO_CONFIRM_MS))

    expect(fail).not.toHaveBeenCalled()
  })

  it('announces the minutes left to screen readers instead of every second', () => {
    const live = container.querySelector('[aria-live="polite"]')!
    expect(live.textContent).toBe('25 minutes left')
    expect(container.querySelector('[role="timer"]')?.textContent).toBe('24:10')
  })

  it.each([
    ['gave_up', 'You gave up this sprout', "It's gone."],
    ['left_app', 'Session failed', 'You left the app before the sprout finished growing.'],
    ['closed', 'Session failed', 'EcoFoco was closed before the sprout finished growing'],
  ] as const)('explains a %s failure honestly, and the Sprout is gone', (reason, title, body) => {
    act(() => useFocusSessionStore.setState({ status: 'failed', failReason: reason }))

    expect(container.querySelector('h1')?.textContent).toBe(title)
    expect(container.textContent).toContain(body)
    // No plant sprite: a failed Sprout disappears rather than wilting.
    expect(container.querySelector('img')).toBeNull()
  })
})
