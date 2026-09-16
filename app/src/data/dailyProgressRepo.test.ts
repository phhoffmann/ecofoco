import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockDb = { query: vi.fn(), run: vi.fn() }
vi.mock('./db', () => ({ getDb: () => Promise.resolve(mockDb) }))

import { getTodayProgress, markDrawCompleted, upsertTodaySteps } from './dailyProgressRepo'

describe('dailyProgressRepo', () => {
  beforeEach(() => {
    mockDb.query.mockReset()
    mockDb.run.mockReset()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-10T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('getTodayProgress returns a zeroed record for today when no row exists', async () => {
    mockDb.query.mockResolvedValue({ values: [] })

    const progress = await getTodayProgress()

    expect(progress).toEqual({ date: '2026-09-10', steps: 0, goalMet: false, drawCompleted: false })
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM daily_progress WHERE date = ?', ['2026-09-10'])
  })

  it('getTodayProgress converts SQLite integer booleans to real booleans', async () => {
    mockDb.query.mockResolvedValue({ values: [{ date: '2026-09-10', steps: 7000, goalMet: 1, drawCompleted: 1 }] })

    const progress = await getTodayProgress()

    expect(progress).toEqual({ date: '2026-09-10', steps: 7000, goalMet: true, drawCompleted: true })
  })

  it('upsertTodaySteps marks the goal met once steps reach the given goal', async () => {
    mockDb.run.mockResolvedValue(undefined)
    mockDb.query.mockResolvedValue({ values: [{ date: '2026-09-10', steps: 6000, goalMet: 1, drawCompleted: 0 }] })

    await upsertTodaySteps(6000, 6000)

    expect(mockDb.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO daily_progress'), [
      '2026-09-10',
      6000,
      1,
    ])
  })

  it('upsertTodaySteps does not mark the goal met below the given goal', async () => {
    mockDb.run.mockResolvedValue(undefined)
    mockDb.query.mockResolvedValue({ values: [{ date: '2026-09-10', steps: 5999, goalMet: 0, drawCompleted: 0 }] })

    await upsertTodaySteps(5999, 6000)

    expect(mockDb.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO daily_progress'), [
      '2026-09-10',
      5999,
      0,
    ])
  })

  it('upsertTodaySteps respects a configured goal different from the default', async () => {
    mockDb.run.mockResolvedValue(undefined)
    mockDb.query.mockResolvedValue({ values: [{ date: '2026-09-10', steps: 6000, goalMet: 0, drawCompleted: 0 }] })

    await upsertTodaySteps(6000, 8000)

    expect(mockDb.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO daily_progress'), [
      '2026-09-10',
      6000,
      0,
    ])
  })

  it('markDrawCompleted updates the drawCompleted flag for today', async () => {
    await markDrawCompleted()
    expect(mockDb.run).toHaveBeenCalledWith('UPDATE daily_progress SET drawCompleted = 1 WHERE date = ?', [
      '2026-09-10',
    ])
  })
})
