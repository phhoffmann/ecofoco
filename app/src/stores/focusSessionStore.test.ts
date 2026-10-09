import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pickRandomSpecies } from '../domain/draw'
import { LEAVE_GRACE_MS } from '../domain/focusSession'
import type { Species } from '../domain/species'

const {
  appListeners,
  lifecycle,
  completeFocusSession,
  failFocusSession,
  saveActiveFocusSession,
  getActiveFocusSession,
  markActiveFocusSessionBackgrounded,
  clearActiveFocusSessionBackgrounded,
  reveal,
  mockSpecies,
} = vi.hoisted(() => {
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
    lifecycle: { pluginAvailable: true, otherAppMs: 0, screenInUse: true },
    completeFocusSession: vi.fn().mockResolvedValue({}),
    failFocusSession: vi.fn().mockResolvedValue({}),
    saveActiveFocusSession: vi.fn().mockResolvedValue(undefined),
    getActiveFocusSession: vi.fn().mockResolvedValue(null),
    markActiveFocusSessionBackgrounded: vi.fn().mockResolvedValue(undefined),
    clearActiveFocusSessionBackgrounded: vi.fn().mockResolvedValue(undefined),
    reveal: vi.fn().mockResolvedValue(undefined),
    mockSpecies,
  }
})

vi.mock('../data/appLifecycle', () => ({
  onAppStateChange: (callback: (isActive: boolean) => void) => {
    appListeners.push(callback)
    return () => {}
  },
  canTellScreenOffFromAppSwitch: () => lifecycle.pluginAvailable,
  timeInOtherAppsMs: async () => lifecycle.otherAppMs,
  isScreenInUse: async () => lifecycle.screenInUse,
}))

vi.mock('../domain/draw', () => ({ pickRandomSpecies: vi.fn(() => mockSpecies) }))
vi.mock('./biomeStore', () => ({ activeBiome: () => 'caatinga' }))
vi.mock('../data/focusSessionRepo', () => ({
  completeFocusSession,
  failFocusSession,
  saveActiveFocusSession,
  getActiveFocusSession,
  markActiveFocusSessionBackgrounded,
  clearActiveFocusSessionBackgrounded,
}))
vi.mock('./collectionStore', () => ({ useCollectionStore: { getState: () => ({ reveal }) } }))

import { useFocusSessionStore } from './focusSessionStore'

async function background() {
  for (const cb of appListeners) cb(false)
  await vi.advanceTimersByTimeAsync(0)
}

async function foreground() {
  for (const cb of appListeners) cb(true)
  await vi.advanceTimersByTimeAsync(0)
}

function expectFailed(plannedSeconds: number, reason = 'left_app') {
  expect(useFocusSessionStore.getState()).toMatchObject({ status: 'failed', failReason: reason })
  expect(failFocusSession).toHaveBeenCalledTimes(1)
  expect(failFocusSession).toHaveBeenCalledWith(expect.any(String), plannedSeconds, reason)
  expect(completeFocusSession).not.toHaveBeenCalled()
  expect(reveal).not.toHaveBeenCalled()
}

describe('focusSessionStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    completeFocusSession.mockClear()
    failFocusSession.mockClear()
    saveActiveFocusSession.mockClear()
    getActiveFocusSession.mockReset().mockResolvedValue(null)
    reveal.mockClear()
    markActiveFocusSessionBackgrounded.mockClear()
    clearActiveFocusSessionBackgrounded.mockClear()
    completeFocusSession.mockResolvedValue({})
    lifecycle.pluginAvailable = true
    lifecycle.otherAppMs = 0
    lifecycle.screenInUse = true
    useFocusSessionStore.getState().reset()
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
    expect(completeFocusSession).toHaveBeenCalledWith({
      startedAt: expect.any(String),
      plannedDurationSeconds: 3,
      speciesId: 'jatoba',
    })
    // One reveal for the catch, with the session's points.
    expect(reveal).toHaveBeenCalledExactlyOnceWith(mockSpecies, 10)
  })

  it('persists the session as soon as it starts, so it survives the process being killed', async () => {
    await useFocusSessionStore.getState().start(900)

    expect(saveActiveFocusSession).toHaveBeenCalledWith({
      startedAt: expect.any(String),
      plannedDurationSeconds: 900,
      speciesId: 'jatoba',
    })
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
    expect(failFocusSession).not.toHaveBeenCalled()
  })

  it('completes the session if the timer runs out while the screen is off', async () => {
    useFocusSessionStore.getState().start(60)
    await background()

    await vi.advanceTimersByTimeAsync(60_000)

    expect(useFocusSessionStore.getState().status).toBe('completed')
    expect(completeFocusSession).toHaveBeenCalledOnce()
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
    expect(failFocusSession).not.toHaveBeenCalled()
  })

  it('records giving up as its own reason, not as leaving the app', async () => {
    useFocusSessionStore.getState().start(60)
    await vi.advanceTimersByTimeAsync(1000)

    await useFocusSessionStore.getState().fail('gave_up')

    expectFailed(60, 'gave_up')
  })

  it('records when the app was backgrounded and whether the screen was on, and clears it on return', async () => {
    useFocusSessionStore.getState().start(600)
    await vi.advanceTimersByTimeAsync(1000)

    lifecycle.screenInUse = false
    await background()
    expect(markActiveFocusSessionBackgrounded).toHaveBeenCalledExactlyOnceWith(new Date(Date.now()).toISOString(), false)

    await foreground()
    expect(clearActiveFocusSessionBackgrounded).toHaveBeenCalledOnce()
  })

  it('keeps a session it could not record as completed, so it can still be given up', async () => {
    completeFocusSession.mockRejectedValueOnce(new Error('SQLITE_FULL'))
    useFocusSessionStore.getState().start(3)
    await vi.advanceTimersByTimeAsync(3000)

    expect(useFocusSessionStore.getState().status).toBe('running')
    expect(reveal).not.toHaveBeenCalled()

    await useFocusSessionStore.getState().fail('gave_up')
    expect(useFocusSessionStore.getState()).toMatchObject({ status: 'failed', failReason: 'gave_up' })
    expect(failFocusSession).toHaveBeenCalledWith(expect.any(String), 3, 'gave_up')
  })

  it('fail() is a no-op when there is no running session', async () => {
    await useFocusSessionStore.getState().fail('gave_up')
    expect(failFocusSession).not.toHaveBeenCalled()
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
      failReason: null,
    })
  })

  describe('recover()', () => {
    const persisted = (startedSecondsAgo: number, plannedDurationSeconds = 600, speciesId = 'quaresmeira') => ({
      startedAt: new Date(Date.now() - startedSecondsAgo * 1000).toISOString(),
      plannedDurationSeconds,
      speciesId,
    })

    it('resumes a session the process died during, keeping its start time and plant', async () => {
      getActiveFocusSession.mockResolvedValue(persisted(120))

      await useFocusSessionStore.getState().recover()

      expect(useFocusSessionStore.getState()).toMatchObject({ status: 'running', remainingSeconds: 480, plannedDurationSeconds: 600 })
      await vi.advanceTimersByTimeAsync(480_000)
      expect(useFocusSessionStore.getState().status).toBe('completed')
      expect(completeFocusSession).toHaveBeenCalledWith(expect.objectContaining({ speciesId: 'quaresmeira' }))
      expect(reveal).toHaveBeenCalledWith(expect.objectContaining({ id: 'quaresmeira' }), 10)
    })

    it('fails a session whose time ran out while the app was closed, saying so', async () => {
      const session = persisted(900)
      getActiveFocusSession.mockResolvedValue(session)

      await useFocusSessionStore.getState().recover()

      expect(useFocusSessionStore.getState()).toMatchObject({ status: 'failed', failReason: 'closed' })
      expect(failFocusSession).toHaveBeenCalledWith(session.startedAt, 600, 'closed')
      expect(completeFocusSession).not.toHaveBeenCalled()
    })

    const backgroundedSecondsAgo = (seconds: number, screenOn: boolean) => ({
      at: new Date(Date.now() - seconds * 1000).toISOString(),
      screenOn,
    })

    it('fails as leaving the app when it was backgrounded with the screen on past the grace period', async () => {
      const session = { ...persisted(120), backgrounded: backgroundedSecondsAgo(LEAVE_GRACE_MS / 1000 + 60, true) }
      getActiveFocusSession.mockResolvedValue(session)

      await useFocusSessionStore.getState().recover()

      expect(useFocusSessionStore.getState()).toMatchObject({ status: 'failed', failReason: 'left_app' })
      expect(failFocusSession).toHaveBeenCalledExactlyOnceWith(session.startedAt, 600, 'left_app')
      expect(completeFocusSession).not.toHaveBeenCalled()
    })

    it('resumes when it was backgrounded with the screen on within the grace period', async () => {
      getActiveFocusSession.mockResolvedValue({ ...persisted(120), backgrounded: backgroundedSecondsAgo(1, true) })

      await useFocusSessionStore.getState().recover()

      expect(useFocusSessionStore.getState()).toMatchObject({ status: 'running', remainingSeconds: 480 })
      expect(failFocusSession).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(0)
      expect(clearActiveFocusSessionBackgrounded).toHaveBeenCalledOnce()
    })

    it('resumes when it was backgrounded with the screen off, however long ago', async () => {
      getActiveFocusSession.mockResolvedValue({ ...persisted(120), backgrounded: backgroundedSecondsAgo(100, false) })

      await useFocusSessionStore.getState().recover()

      expect(useFocusSessionStore.getState()).toMatchObject({ status: 'running', remainingSeconds: 480 })
      expect(failFocusSession).not.toHaveBeenCalled()
    })

    it('still fails as closed when it was backgrounded with the screen off and its time ran out', async () => {
      const session = { ...persisted(900), backgrounded: backgroundedSecondsAgo(800, false) }
      getActiveFocusSession.mockResolvedValue(session)

      await useFocusSessionStore.getState().recover()

      expect(useFocusSessionStore.getState()).toMatchObject({ status: 'failed', failReason: 'closed' })
      expect(failFocusSession).toHaveBeenCalledExactlyOnceWith(session.startedAt, 600, 'closed')
    })

    it('does nothing when no session was running', async () => {
      await useFocusSessionStore.getState().recover()

      expect(useFocusSessionStore.getState().status).toBe('idle')
      expect(failFocusSession).not.toHaveBeenCalled()
    })
  })
})
