import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { useDailyProgressStore } from '../stores/dailyProgressStore'
import { ActivityScreen } from './ActivityScreen'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { appStateListeners, unsubscribe } = vi.hoisted(() => ({
  appStateListeners: [] as Array<(isActive: boolean) => void>,
  unsubscribe: vi.fn(),
}))
vi.mock('../data/appLifecycle', () => ({
  onAppStateChange: (callback: (isActive: boolean) => void) => {
    appStateListeners.push(callback)
    return unsubscribe
  },
}))
vi.mock('../data/stepProvider', () => ({}))
vi.mock('../data/dailyProgressRepo', () => ({}))
vi.mock('../data/collectionRepo', () => ({}))

describe('ActivityScreen', () => {
  let container: HTMLDivElement
  let root: Root
  const refresh = vi.fn()

  beforeEach(() => {
    appStateListeners.length = 0
    unsubscribe.mockClear()
    refresh.mockReset().mockResolvedValue(undefined)
    useDailyProgressStore.setState({
      healthAvailable: true,
      authorized: true,
      progress: { date: '2026-09-10', steps: 3200, goalMet: false, drawCompleted: false },
      refresh,
    })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<ActivityScreen />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('refreshes steps when the app comes back to the foreground', () => {
    expect(refresh).toHaveBeenCalledTimes(1)

    act(() => appStateListeners.forEach((l) => l(false)))
    expect(refresh).toHaveBeenCalledTimes(1)

    act(() => appStateListeners.forEach((l) => l(true)))
    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it('stops listening once the screen is left', () => {
    act(() => root.unmount())
    expect(unsubscribe).toHaveBeenCalled()
    root = createRoot(container)
  })
})
