import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestDb } from './testing/sqliteTestDb'

const mockDb = { query: vi.fn(), run: vi.fn() }
vi.mock('./db', () => ({ getDb: () => Promise.resolve(mockDb) }))

import { addBiomeUnlock, listBiomeUnlocks } from './biomeUnlockRepo'
import { sumStepGoalPoints } from './dailyProgressRepo'
import { sumFocusSessionPoints } from './focusSessionRepo'

describe('biomeUnlockRepo', () => {
  beforeEach(() => {
    mockDb.query.mockReset()
    mockDb.run.mockReset()
  })

  it('listBiomeUnlocks drops rows for biomes that no longer exist', async () => {
    const caatinga = { biomeId: 'caatinga', unlockedAt: '2026-10-01T00:00:00.000Z', cost: 100 }
    mockDb.query.mockResolvedValue({ values: [caatinga, { ...caatinga, biomeId: 'tundra' }] })
    expect(await listBiomeUnlocks()).toEqual([caatinga])
  })

  it('addBiomeUnlock records the biome and what it cost, queued for sync', async () => {
    const testDb = await createTestDb()
    mockDb.query.mockImplementation(testDb.query)
    mockDb.run.mockImplementation(testDb.run)

    await addBiomeUnlock('caatinga', 100)

    expect(await listBiomeUnlocks()).toEqual([{ biomeId: 'caatinga', unlockedAt: expect.any(String), cost: 100 }])
    expect((await testDb.query('SELECT pendingSync FROM biome_unlocks')).values).toEqual([{ pendingSync: 1 }])
  })
})

describe('point sources', () => {
  beforeEach(() => mockDb.query.mockReset())

  it('sumFocusSessionPoints adds up the points recorded on each session', async () => {
    mockDb.query.mockResolvedValue({ values: [{ points: 85 }] })
    expect(await sumFocusSessionPoints()).toBe(85)
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('SUM(points)'))
  })

  it('sumStepGoalPoints adds up the points recorded on each day', async () => {
    mockDb.query.mockResolvedValue({ values: [{ points: 40 }] })
    expect(await sumStepGoalPoints()).toBe(40)
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('SUM(points)'))
  })
})
