import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Species } from '../domain/species'

const {
  mockSpecies,
  addCollectedEntry,
  getTodayProgress,
  upsertTodaySteps,
  markDrawCompleted,
  isHealthAvailable,
  isStepsAuthorized,
  requestStepsAuthorization,
  getTodaySteps,
} = vi.hoisted(() => ({
  mockSpecies: {
    id: 'quati',
    scientificName: 'Nasua nasua',
    type: 'animal',
    rarity: 'rare',
    biome: ['atlantic-forest'],
    image: 'quati.jpg',
    imageLicense: 'CC0',
  } as Species,
  addCollectedEntry: vi.fn().mockResolvedValue({ id: 'entry-1' }),
  getTodayProgress: vi.fn(),
  upsertTodaySteps: vi.fn(),
  markDrawCompleted: vi.fn().mockResolvedValue(undefined),
  isHealthAvailable: vi.fn(),
  isStepsAuthorized: vi.fn(),
  requestStepsAuthorization: vi.fn(),
  getTodaySteps: vi.fn(),
}))

vi.mock('../data/collectionRepo', () => ({ addCollectedEntry }))
vi.mock('../data/dailyProgressRepo', () => ({ getTodayProgress, upsertTodaySteps, markDrawCompleted }))
vi.mock('../data/stepProvider', () => ({
  isHealthAvailable,
  isStepsAuthorized,
  requestStepsAuthorization,
  getTodaySteps,
  writeTestSteps: vi.fn(),
}))
vi.mock('../domain/draw', () => ({ pickRandomSpecies: vi.fn(() => mockSpecies) }))

import { useDailyProgressStore } from './dailyProgressStore'

const idleProgress = { date: '2026-09-10', steps: 0, goalMet: false, drawCompleted: false }

describe('dailyProgressStore', () => {
  beforeEach(() => {
    addCollectedEntry.mockClear()
    getTodayProgress.mockReset().mockResolvedValue(idleProgress)
    upsertTodaySteps.mockReset()
    markDrawCompleted.mockClear()
    isHealthAvailable.mockReset()
    isStepsAuthorized.mockReset()
    requestStepsAuthorization.mockReset()
    getTodaySteps.mockReset()
    useDailyProgressStore.setState({
      healthAvailable: null,
      authorized: false,
      progress: idleProgress,
      resultSpecies: null,
      loading: false,
      error: null,
    })
  })

  it('refresh() falls back to stored progress when Health Connect is unavailable', async () => {
    isHealthAvailable.mockResolvedValue(false)

    await useDailyProgressStore.getState().refresh()

    const state = useDailyProgressStore.getState()
    expect(state.healthAvailable).toBe(false)
    expect(state.authorized).toBe(false)
    expect(state.progress).toEqual(idleProgress)
    expect(getTodayProgress).toHaveBeenCalled()
    expect(upsertTodaySteps).not.toHaveBeenCalled()
  })

  it('refresh() pulls and stores today\'s steps when authorized', async () => {
    isHealthAvailable.mockResolvedValue(true)
    isStepsAuthorized.mockResolvedValue(true)
    getTodaySteps.mockResolvedValue(6500)
    const updated = { date: '2026-09-10', steps: 6500, goalMet: true, drawCompleted: false }
    upsertTodaySteps.mockResolvedValue(updated)

    await useDailyProgressStore.getState().refresh()

    expect(upsertTodaySteps).toHaveBeenCalledWith(6500, 6000)
    expect(useDailyProgressStore.getState().progress).toEqual(updated)
  })

  it('connect() requests authorization and refreshes on success', async () => {
    requestStepsAuthorization.mockResolvedValue(true)
    isHealthAvailable.mockResolvedValue(true)
    isStepsAuthorized.mockResolvedValue(true)
    getTodaySteps.mockResolvedValue(100)
    upsertTodaySteps.mockResolvedValue({ date: '2026-09-10', steps: 100, goalMet: false, drawCompleted: false })

    await useDailyProgressStore.getState().connect()

    expect(useDailyProgressStore.getState().authorized).toBe(true)
    expect(getTodaySteps).toHaveBeenCalled()
  })

  it('connect() does not refresh when the user denies authorization', async () => {
    requestStepsAuthorization.mockResolvedValue(false)

    await useDailyProgressStore.getState().connect()

    expect(useDailyProgressStore.getState().authorized).toBe(false)
    expect(getTodaySteps).not.toHaveBeenCalled()
  })

  it('draw() is a no-op when the step goal has not been met', async () => {
    useDailyProgressStore.setState({ progress: { ...idleProgress, goalMet: false } })

    await useDailyProgressStore.getState().draw()

    expect(addCollectedEntry).not.toHaveBeenCalled()
    expect(markDrawCompleted).not.toHaveBeenCalled()
  })

  it('draw() is a no-op when today\'s draw is already completed', async () => {
    useDailyProgressStore.setState({ progress: { ...idleProgress, goalMet: true, drawCompleted: true } })

    await useDailyProgressStore.getState().draw()

    expect(addCollectedEntry).not.toHaveBeenCalled()
  })

  it('draw() collects a random animal and marks the day as drawn when the goal is met', async () => {
    useDailyProgressStore.setState({ progress: { ...idleProgress, goalMet: true, drawCompleted: false } })
    const afterDraw = { ...idleProgress, goalMet: true, drawCompleted: true }
    getTodayProgress.mockResolvedValue(afterDraw)

    await useDailyProgressStore.getState().draw()

    expect(addCollectedEntry).toHaveBeenCalledWith('quati', 'draw')
    expect(markDrawCompleted).toHaveBeenCalled()
    const state = useDailyProgressStore.getState()
    expect(state.resultSpecies).toEqual(mockSpecies)
    expect(state.progress).toEqual(afterDraw)
  })
})
