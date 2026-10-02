import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDb = { query: vi.fn(), run: vi.fn() }
vi.mock('./db', () => ({ getDb: () => Promise.resolve(mockDb) }))

import { addBiomeUnlock, listBiomeUnlocks } from './biomeUnlockRepo'
import { countStepGoalDaysMet } from './dailyProgressRepo'
import { countCompletedFocusSessions } from './focusSessionRepo'

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

  it('addBiomeUnlock records the biome and what it cost', async () => {
    await addBiomeUnlock('caatinga', 100)
    expect(mockDb.run).toHaveBeenCalledWith('INSERT INTO biome_unlocks (biomeId, unlockedAt, cost) VALUES (?, ?, ?)', [
      'caatinga',
      expect.any(String),
      100,
    ])
  })
})

describe('point sources', () => {
  beforeEach(() => mockDb.query.mockReset())

  it('countCompletedFocusSessions counts only completed sessions', async () => {
    mockDb.query.mockResolvedValue({ values: [{ count: 4 }] })
    expect(await countCompletedFocusSessions()).toBe(4)
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining("status = 'completed'"))
  })

  it('countStepGoalDaysMet counts days with the goal met', async () => {
    mockDb.query.mockResolvedValue({ values: [{ count: 2 }] })
    expect(await countStepGoalDaysMet()).toBe(2)
    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('goalMet = 1'))
  })
})
