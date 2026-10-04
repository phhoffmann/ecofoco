import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pickRandomSpecies } from '../domain/draw'
import { LEAVE_GRACE_MS } from '../domain/focusSession'
import type { Species } from '../domain/species'

const { appListeners, lifecycle, addCollectedEntry, recordFocusSession, mockSpecies } = vi.hoisted(() => {
  const mockSpecies: Species = {
    id: 'jatoba',
    scientificName: 'Hymenaea courbaril',
    type: 'plant',
    rarityByBiome: { 'atlantic-forest': 'common' },
    biome: ['atlantic-forest'],
    archetype: 'broadleaf-tree',
    image: 'jatoba.jpg',
    names: { en: 'jatoba', 'pt-BR': 'jatoba' },
    descriptions: { en: '', 'pt-BR': '' },
    photo: { license: 'CC0', credit: 'Test', sourceUrl: 'https://www.inaturalist.org/observations/1' },
  }
  return {
    appListeners: [] as Array<(isActive: boolean) => void>,
    // Stands in for the native AwayTracker plugin.
    lifecycle: { pluginAvailable: true, otherAppMs: 0 },
    addCollectedEntry: vi.fn().mockResolvedValue({ id: 'entry-1' }),
    recordFocusSession: vi.fn().mockResolvedValue({ id: 'session-1' }),
    mockSpecies,
  }
})

vi.mock('../data/appLifecycle', () => ({
  onAppStateChange: (callback: (isActive: boolean) => void) => {
    appListeners.push(callback)
  },
  canTellScreenOffFromAppSwitch: () => lifecycle.pluginAvailable,
  timeInOtherAppsMs: async () => lifecycle.otherAppMs,
}))

vi.mock('../domain/draw', () => ({ pickRandomSpecies: vi.fn(() => mockSpecies) }))
vi.mock('./biomeStore', () => ({ activeBiome: () => 'caatinga' }))
vi.mock('../data/collectionRepo', () => ({ addCollectedEntry }))
vi.mock('../data/focusSessionRepo', () => ({ recordFocusSession }))
vi.mock('../data/haptics', () => ({ lightHaptic: vi.fn() }))

import { useCelebrationStore } from './celebrationStore'
import { useFocusSessionStore } from './focusSessionStore'

async function background() {
  for (const cb of appListeners) cb(false)
  await vi.advanceTimersByTimeAsync(0)
}

async function foreground() {
  for (const cb of appListeners) cb(true)
  await vi.advanceTimersByTimeAsync(0)
}

function expectFailed(plannedSeconds: number) {
  expect(useFocusSessionStore.getState().status).toBe('failed')
  expect(recordFocusSession).toHaveBeenCalledTimes(1)
  expect(recordFocusSession).toHaveBeenCalledWith(expect.any(String), plannedSeconds, 'failed')
  expect(addCollectedEntry).not.toHaveBeenCalled()
  expect(useCelebrationStore.getState().species).toBeNull()
}

describe('focusSessionStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    addCollectedEntry.mockClear()
    recordFocusSession.mockClear()
    lifecycle.pluginAvailable = true
    lifecycle.otherAppMs = 0
    useFocusSessionStore.getState().reset()
    useCelebrationStore.setState({ species: null })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('completes the session and collects a plant when the timer runs out', async () => {
    useFocusSessionStore.getState().start(3)
    expect(useFocusSessionStore.getState().status).toBe('running')

    await vi.advanceTimersByTimeAsync(3000)

    const state = useFocusSessionStore.getState()
    expect(state.status).toBe('completed')
    expect(state.resultSpecies).toEqual(mockSpecies)
    expect(pickRandomSpecies).toHaveBeenCalledWith('plant', 'caatinga')
    expect(addCollectedEntry).toHaveBeenCalledWith('jatoba', 'focus_session')
    expect(recordFocusSession).toHaveBeenCalledWith(expect.any(String), 3, 'completed')
    expect(useCelebrationStore.getState().species).toEqual(mockSpecies)
  })

  it('grows the sprout into the shape of the plant it will collect, without revealing the plant early', async () => {
    useFocusSessionStore.getState().start(3)

    expect(useFocusSessionStore.getState()).toMatchObject({ growingArchetype: 'broadleaf-tree', resultSpecies: null })
    expect(pickRandomSpecies).toHaveBeenCalledWith('plant', 'caatinga')

    await vi.advanceTimersByTimeAsync(3000)
    expect(useFocusSessionStore.getState().resultSpecies?.archetype).toBe('broadleaf-tree')
  })

  it('keeps the session running while the screen is off or locked, timing it from the wall clock', async () => {
    useFocusSessionStore.getState().start(600)
    await background()

    await vi.advanceTimersByTimeAsync(120_000)
    await foreground()

    expect(useFocusSessionStore.getState()).toMatchObject({ status: 'running', remainingSeconds: 480 })
    expect(recordFocusSession).not.toHaveBeenCalled()
  })

  it('completes the session if the timer runs out while the screen is off', async () => {
    useFocusSessionStore.getState().start(60)
    await background()

    await vi.advanceTimersByTimeAsync(60_000)

    expect(useFocusSessionStore.getState().status).toBe('completed')
    expect(recordFocusSession).toHaveBeenCalledWith(expect.any(String), 60, 'completed')
  })

  it('keeps the session when the user returns from another app within the grace period', async () => {
    useFocusSessionStore.getState().start(60)
    await background()

    lifecycle.otherAppMs = LEAVE_GRACE_MS
    await vi.advanceTimersByTimeAsync(LEAVE_GRACE_MS)
    await foreground()

    expect(useFocusSessionStore.getState().status).toBe('running')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(useFocusSessionStore.getState().status).toBe('completed')
  })

  it('fails the session while the user stays in another app past the grace period', async () => {
    useFocusSessionStore.getState().start(60)
    await vi.advanceTimersByTimeAsync(1000)
    await background()

    lifecycle.otherAppMs = LEAVE_GRACE_MS + 1
    await vi.advanceTimersByTimeAsync(1000)

    expectFailed(60)
    // the interval must actually be cleared — advancing further must not flip it to 'completed'
    await vi.advanceTimersByTimeAsync(60_000)
    expect(useFocusSessionStore.getState().status).toBe('failed')
  })

  it('fails the session on return when background checks never ran', async () => {
    useFocusSessionStore.getState().start(60)
    await background()

    lifecycle.otherAppMs = LEAVE_GRACE_MS + 1
    await foreground()

    expectFailed(60)
  })

  it('fails rather than completes when the timer ran out while the user was in another app', async () => {
    useFocusSessionStore.getState().start(60)
    await background()

    // Timers stalled in the background: the wall clock jumps past the end before any check runs.
    lifecycle.otherAppMs = 90_000
    vi.setSystemTime(Date.now() + 90_000)
    await vi.advanceTimersByTimeAsync(250)

    expectFailed(60)
  })

  it('fails as soon as the app is backgrounded when screen-off detection is unavailable (web/dev)', async () => {
    lifecycle.pluginAvailable = false
    useFocusSessionStore.getState().start(60)
    await vi.advanceTimersByTimeAsync(1000)

    await background()

    expectFailed(60)
  })

  it('ignores the app being backgrounded when no session is running', async () => {
    lifecycle.otherAppMs = LEAVE_GRACE_MS + 1
    await background()
    await vi.advanceTimersByTimeAsync(10_000)

    expect(useFocusSessionStore.getState().status).toBe('idle')
    expect(recordFocusSession).not.toHaveBeenCalled()
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
      growingArchetype: null,
      resultSpecies: null,
    })
  })
})
