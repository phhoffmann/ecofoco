import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pickRandomSpecies } from '../domain/draw'
import type { Species } from '../domain/species'

const { appListeners, addCollectedEntry, recordFocusSession, keepScreenAwake, allowScreenSleep, mockSpecies } =
  vi.hoisted(() => {
    const mockSpecies: Species = {
      id: 'jatoba',
      scientificName: 'Hymenaea courbaril',
      type: 'plant',
      rarity: 'common',
      biome: ['atlantic-forest'],
      archetype: 'broadleaf-tree',
      image: 'jatoba.jpg',
      imageLicense: 'CC0',
    }
    return {
      appListeners: [] as Array<() => void>,
      addCollectedEntry: vi.fn().mockResolvedValue({ id: 'entry-1' }),
      recordFocusSession: vi.fn().mockResolvedValue({ id: 'session-1' }),
      keepScreenAwake: vi.fn().mockResolvedValue(undefined),
      allowScreenSleep: vi.fn().mockResolvedValue(undefined),
      mockSpecies,
    }
  })

vi.mock('../data/appLifecycle', () => ({
  onAppBackgrounded: (callback: () => void) => {
    appListeners.push(callback)
  },
}))

vi.mock('../data/screenWakeLock', () => ({ keepScreenAwake, allowScreenSleep }))
vi.mock('../domain/draw', () => ({ pickRandomSpecies: vi.fn(() => mockSpecies) }))
vi.mock('./biomeStore', () => ({ activeBiome: () => 'caatinga' }))
vi.mock('../data/collectionRepo', () => ({ addCollectedEntry }))
vi.mock('../data/focusSessionRepo', () => ({ recordFocusSession }))
vi.mock('../data/haptics', () => ({ lightHaptic: vi.fn() }))

import { useCelebrationStore } from './celebrationStore'
import { useFocusSessionStore } from './focusSessionStore'

function triggerBackground() {
  for (const cb of appListeners) cb()
}

describe('focusSessionStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    addCollectedEntry.mockClear()
    recordFocusSession.mockClear()
    keepScreenAwake.mockClear()
    allowScreenSleep.mockClear()
    useFocusSessionStore.getState().reset()
    useCelebrationStore.setState({ species: null })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('completes the session and collects a plant when the timer runs out', async () => {
    useFocusSessionStore.getState().start(3)
    expect(useFocusSessionStore.getState().status).toBe('running')
    expect(keepScreenAwake).toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(3000)

    const state = useFocusSessionStore.getState()
    expect(state.status).toBe('completed')
    expect(state.resultSpecies).toEqual(mockSpecies)
    expect(pickRandomSpecies).toHaveBeenCalledWith('plant', 'caatinga')
    expect(addCollectedEntry).toHaveBeenCalledWith('jatoba', 'focus_session')
    expect(recordFocusSession).toHaveBeenCalledWith(expect.any(String), 3, 'completed')
    expect(allowScreenSleep).toHaveBeenCalled()
    expect(useCelebrationStore.getState().species).toEqual(mockSpecies)
  })

  it('fails the session if the app is backgrounded before completion (e.g. the screen auto-locks)', async () => {
    useFocusSessionStore.getState().start(60)
    await vi.advanceTimersByTimeAsync(1000)

    triggerBackground()
    await vi.advanceTimersByTimeAsync(0)

    expect(useFocusSessionStore.getState().status).toBe('failed')
    expect(recordFocusSession).toHaveBeenCalledWith(expect.any(String), 60, 'failed')
    expect(addCollectedEntry).not.toHaveBeenCalled()
    expect(allowScreenSleep).toHaveBeenCalled()

    expect(useCelebrationStore.getState().species).toBeNull()
    // the interval must actually be cleared — advancing further must not flip it to 'completed'
    await vi.advanceTimersByTimeAsync(60_000)
    expect(useFocusSessionStore.getState().status).toBe('failed')
  })

  it('fail() is a no-op when there is no running session', async () => {
    await useFocusSessionStore.getState().fail()
    expect(recordFocusSession).not.toHaveBeenCalled()
    expect(useFocusSessionStore.getState().status).toBe('idle')
  })

  it('reset() returns to idle and clears the result', async () => {
    useFocusSessionStore.getState().start(3)
    await vi.advanceTimersByTimeAsync(3000)
    expect(useFocusSessionStore.getState().status).toBe('completed')

    useFocusSessionStore.getState().reset()

    expect(useFocusSessionStore.getState()).toMatchObject({
      status: 'idle',
      plannedDurationSeconds: 0,
      remainingSeconds: 0,
      resultSpecies: null,
    })
  })
})
