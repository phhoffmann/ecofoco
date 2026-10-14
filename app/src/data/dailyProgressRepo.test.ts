import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mockDb = { query: vi.fn(), run: vi.fn() }
vi.mock('./db', () => ({ getDb: () => Promise.resolve(mockDb) }))

import { countStepGoalDaysMet, getTodayProgress, markDrawCompleted, upsertTodaySteps } from './dailyProgressRepo'
import { createTestDb, type TestDb } from './testing/sqliteTestDb'

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
      '2026-09-10T12:00:00.000Z',
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
      '2026-09-10T12:00:00.000Z',
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
      '2026-09-10T12:00:00.000Z',
    ])
  })

  it('markDrawCompleted updates the drawCompleted flag for today, queued for sync', async () => {
    await markDrawCompleted()
    expect(mockDb.run).toHaveBeenCalledWith(
      'UPDATE daily_progress SET drawCompleted = 1, updatedAt = ?, pendingSync = 1 WHERE date = ?',
      ['2026-09-10T12:00:00.000Z', '2026-09-10'],
    )
  })
})

describe('dailyProgressRepo on a real database', () => {
  let testDb: TestDb

  beforeEach(async () => {
    testDb = await createTestDb()
    mockDb.query.mockReset().mockImplementation(testDb.query)
    mockDb.run.mockReset().mockImplementation(testDb.run)
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-10T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps the goal met when the step goal is raised later the same day', async () => {
    expect((await upsertTodaySteps(6500, 6000)).goalMet).toBe(true)

    const afterRaise = await upsertTodaySteps(6600, 8000)

    expect(afterRaise).toMatchObject({ steps: 6600, goalMet: true })
    expect(await countStepGoalDaysMet()).toBe(1)
  })

  it('still marks the goal met later in the day once steps reach it', async () => {
    expect((await upsertTodaySteps(3000, 6000)).goalMet).toBe(false)
    expect((await upsertTodaySteps(6100, 6000)).goalMet).toBe(true)
  })

  const syncFields = async () => (await testDb.query('SELECT updatedAt, pendingSync FROM daily_progress')).values

  it('queues a changed step count for sync, stamped with when it changed', async () => {
    await upsertTodaySteps(3000, 6000)
    expect(await syncFields()).toEqual([{ updatedAt: '2026-09-10T12:00:00.000Z', pendingSync: 1 }])

    // As if a sync had uploaded the row.
    await testDb.run('UPDATE daily_progress SET pendingSync = 0')
    vi.setSystemTime(new Date('2026-09-10T13:00:00.000Z'))
    await upsertTodaySteps(3500, 6000)

    expect(await syncFields()).toEqual([{ updatedAt: '2026-09-10T13:00:00.000Z', pendingSync: 1 }])
  })

  it('leaves the row alone when a step reading changes nothing', async () => {
    await upsertTodaySteps(3000, 6000)
    await testDb.run('UPDATE daily_progress SET pendingSync = 0')
    vi.setSystemTime(new Date('2026-09-10T13:00:00.000Z'))

    await upsertTodaySteps(3000, 6000)

    expect(await syncFields()).toEqual([{ updatedAt: '2026-09-10T12:00:00.000Z', pendingSync: 0 }])
  })

  it('queues the Draw for sync', async () => {
    await upsertTodaySteps(6500, 6000)
    await testDb.run('UPDATE daily_progress SET pendingSync = 0')
    vi.setSystemTime(new Date('2026-09-10T13:00:00.000Z'))

    await markDrawCompleted()

    expect(await syncFields()).toEqual([{ updatedAt: '2026-09-10T13:00:00.000Z', pendingSync: 1 }])
  })
})

describe('dailyProgressRepo at UTC−3 (America/Sao_Paulo)', () => {
  const drawCompletedDates = new Set<string>()

  beforeAll(() => {
    vi.stubEnv('TZ', 'America/Sao_Paulo')
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  beforeEach(() => {
    drawCompletedDates.clear()
    mockDb.run.mockReset()
    mockDb.query.mockReset()
    mockDb.run.mockImplementation(async (sql: string, values: string[]) => {
      if (sql.startsWith('UPDATE daily_progress SET drawCompleted = 1')) drawCompletedDates.add(values[values.length - 1])
    })
    mockDb.query.mockImplementation(async (_sql: string, [date]: [string]) => ({
      values: [{ date, steps: 7000, goalMet: 1, drawCompleted: drawCompletedDates.has(date) ? 1 : 0 }],
    }))
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps one Draw per local day across the 21:00 local (00:00 UTC) boundary', async () => {
    vi.setSystemTime(new Date('2026-09-10T23:00:00.000Z')) // 20:00 local, Sept 10
    expect((await getTodayProgress()).drawCompleted).toBe(false)
    await markDrawCompleted()

    vi.setSystemTime(new Date('2026-09-11T00:30:00.000Z')) // 21:30 local, still Sept 10
    const evening = await getTodayProgress()
    expect(evening.date).toBe('2026-09-10')
    expect(evening.drawCompleted).toBe(true)

    vi.setSystemTime(new Date('2026-09-11T03:00:00.000Z')) // 00:00 local, Sept 11
    const nextDay = await getTodayProgress()
    expect(nextDay.date).toBe('2026-09-11')
    expect(nextDay.drawCompleted).toBe(false)
  })
})
