import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestDb, type TestDb } from './testing/sqliteTestDb'

const mockDb = { query: vi.fn(), run: vi.fn() }
vi.mock('./db', () => ({ getDb: () => Promise.resolve(mockDb) }))

import {
  getCollectionView,
  getCurrentBiome,
  getHomeBiome,
  getHomeBiomeSource,
  getDisplayPreferences,
  getStepGoal,
  setCollectionView,
  setDisplayPreference,
  setHomeBiome,
  setStepGoal,
} from './settingsRepo'

describe('settingsRepo', () => {
  beforeEach(() => {
    mockDb.query.mockReset()
    mockDb.run.mockReset()
  })

  it('getDisplayPreferences gives every preference its default when unset', async () => {
    mockDb.query.mockResolvedValue({ values: [] })
    expect(await getDisplayPreferences()).toEqual({ celebrations: true, haptics: true, motion: 'system', timerPill: true })
  })

  it('getDisplayPreferences reads stored values and ignores unknown ones', async () => {
    const stored: Record<string, string> = {
      'display.celebrations': 'false',
      'display.haptics': 'nonsense',
      'display.motion': 'reduce',
      'display.timerPill': 'false',
    }
    mockDb.query.mockImplementation(async (_sql: string, [key]: [string]) => ({
      values: key in stored ? [{ value: stored[key] }] : [],
    }))
    expect(await getDisplayPreferences()).toEqual({ celebrations: false, haptics: true, motion: 'reduce', timerPill: false })
  })

  it('setDisplayPreference persists the value as a string under its own key', async () => {
    await setDisplayPreference('timerPill', false)
    expect(mockDb.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO settings'), ['display.timerPill', 'false', expect.any(String)])
  })

  it('getStepGoal falls back to the default (6000) when unset', async () => {
    mockDb.query.mockResolvedValue({ values: [] })
    expect(await getStepGoal()).toBe(6000)
  })

  it('getStepGoal falls back to the default when the stored value is invalid', async () => {
    mockDb.query.mockResolvedValue({ values: [{ value: 'not-a-number' }] })
    expect(await getStepGoal()).toBe(6000)
  })

  it('getStepGoal reflects a valid stored value', async () => {
    mockDb.query.mockResolvedValue({ values: [{ value: '8000' }] })
    expect(await getStepGoal()).toBe(8000)
  })

  it('setStepGoal persists the value as a string', async () => {
    await setStepGoal(8000)
    expect(mockDb.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO settings'), ['stepGoal', '8000', expect.any(String)])
  })

  it('getCollectionView defaults to the grid when unset', async () => {
    mockDb.query.mockResolvedValue({ values: [] })
    expect(await getCollectionView()).toBe('grid')
  })

  it('getCollectionView falls back to the grid when the stored value is invalid', async () => {
    mockDb.query.mockResolvedValue({ values: [{ value: 'hexagonal' }] })
    expect(await getCollectionView()).toBe('grid')
  })

  it('getCollectionView reflects a stored "isometric" value', async () => {
    mockDb.query.mockResolvedValue({ values: [{ value: 'isometric' }] })
    expect(await getCollectionView()).toBe('isometric')
  })

  it('setCollectionView persists the value', async () => {
    await setCollectionView('isometric')
    expect(mockDb.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO settings'), [
      'collectionView',
      'isometric',
      expect.any(String),
    ])
  })

  it('getHomeBiome is null until onboarding stores one', async () => {
    mockDb.query.mockResolvedValue({ values: [] })
    expect(await getHomeBiome()).toBeNull()
  })

  it('getHomeBiome and getCurrentBiome ignore unknown biome ids', async () => {
    mockDb.query.mockResolvedValue({ values: [{ value: 'tundra' }] })
    expect(await getHomeBiome()).toBeNull()
    expect(await getCurrentBiome()).toBeNull()
  })

  it('getCurrentBiome reflects a stored biome id', async () => {
    mockDb.query.mockResolvedValue({ values: [{ value: 'caatinga' }] })
    expect(await getCurrentBiome()).toBe('caatinga')
  })

  it('setHomeBiome persists only the biome id and how it was set', async () => {
    await setHomeBiome('caatinga', 'detected')
    expect(mockDb.run.mock.calls.map(([, [key, value]]) => [key, value])).toEqual([
      ['homeBiome', 'caatinga'],
      ['homeBiomeSource', 'detected'],
    ])
  })

  it('getHomeBiomeSource counts a missing or unknown source as picked', async () => {
    mockDb.query.mockResolvedValue({ values: [] })
    expect(await getHomeBiomeSource()).toBe('picked')
    mockDb.query.mockResolvedValue({ values: [{ value: 'detected' }] })
    expect(await getHomeBiomeSource()).toBe('detected')
  })
})

describe('settingsRepo on a real database', () => {
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

  const syncFields = async () => (await testDb.query("SELECT value, updatedAt, pendingSync FROM settings WHERE key = 'stepGoal'")).values

  it('queues a changed setting for sync, stamped with when it changed', async () => {
    await setStepGoal(8000)
    expect(await syncFields()).toEqual([{ value: '8000', updatedAt: '2026-09-10T12:00:00.000Z', pendingSync: 1 }])

    // As if a sync had uploaded the row.
    await testDb.run('UPDATE settings SET pendingSync = 0')
    vi.setSystemTime(new Date('2026-09-10T13:00:00.000Z'))
    await setStepGoal(9000)

    expect(await syncFields()).toEqual([{ value: '9000', updatedAt: '2026-09-10T13:00:00.000Z', pendingSync: 1 }])
    expect(await getStepGoal()).toBe(9000)
  })

  it('leaves the row alone when a setting is set to the value it already has', async () => {
    await setStepGoal(8000)
    await testDb.run('UPDATE settings SET pendingSync = 0')
    vi.setSystemTime(new Date('2026-09-10T13:00:00.000Z'))

    await setStepGoal(8000)

    expect(await syncFields()).toEqual([{ value: '8000', updatedAt: '2026-09-10T12:00:00.000Z', pendingSync: 0 }])
  })
})
