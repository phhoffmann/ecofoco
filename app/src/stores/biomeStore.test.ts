import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getHomeBiome: vi.fn(),
  setHomeBiome: vi.fn().mockResolvedValue(undefined),
  getHomeBiomeSource: vi.fn(),
  getCurrentBiome: vi.fn(),
  setCurrentBiome: vi.fn().mockResolvedValue(undefined),
  listBiomeUnlocks: vi.fn(),
  addBiomeUnlock: vi.fn().mockResolvedValue(undefined),
  countCompletedFocusSessions: vi.fn(),
  countStepGoalDaysMet: vi.fn(),
  getApproximatePosition: vi.fn(),
  loadEcoregionGrid: vi.fn().mockResolvedValue({}),
  biomeAt: vi.fn(),
  // Every Biome has a catalog now; tests add one here to cover a Biome whose species are still coming.
  comingSoon: new Set<string>(),
}))
vi.mock('../data/settingsRepo', () => ({
  getHomeBiome: mocks.getHomeBiome,
  setHomeBiome: mocks.setHomeBiome,
  getHomeBiomeSource: mocks.getHomeBiomeSource,
  getCurrentBiome: mocks.getCurrentBiome,
  setCurrentBiome: mocks.setCurrentBiome,
}))
vi.mock('../data/biomeUnlockRepo', () => ({
  listBiomeUnlocks: mocks.listBiomeUnlocks,
  addBiomeUnlock: mocks.addBiomeUnlock,
}))
vi.mock('../data/focusSessionRepo', () => ({ countCompletedFocusSessions: mocks.countCompletedFocusSessions }))
vi.mock('../data/dailyProgressRepo', () => ({ countStepGoalDaysMet: mocks.countStepGoalDaysMet }))
vi.mock('../data/location', () => ({ getApproximatePosition: mocks.getApproximatePosition }))
vi.mock('../data/ecoregionGrid', () => ({ loadEcoregionGrid: mocks.loadEcoregionGrid }))
vi.mock('../domain/biomeLookup', () => ({ biomeAt: mocks.biomeAt }))
vi.mock('../domain/biome', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../domain/biome')>()
  return {
    ...actual,
    hasCatalog: (biome: Parameters<typeof actual.hasCatalog>[0]) => !mocks.comingSoon.has(biome) && actual.hasCatalog(biome),
  }
})

import { NEIGHBOUR_UNLOCK_COST } from '../domain/biome'
import { activeBiome, selectBiomeProgress, useBiomeStore } from './biomeStore'

async function loadWith({
  home = 'atlantic-forest',
  source = 'picked',
  current = null,
  unlocks = [],
  sessions = 0,
  goalDays = 0,
}: {
  home?: string | null
  source?: string
  current?: string | null
  unlocks?: { biomeId: string; cost: number }[]
  sessions?: number
  goalDays?: number
} = {}) {
  mocks.getHomeBiome.mockResolvedValue(home)
  mocks.getHomeBiomeSource.mockResolvedValue(source)
  mocks.getCurrentBiome.mockResolvedValue(current)
  mocks.listBiomeUnlocks.mockResolvedValue(unlocks.map((u) => ({ ...u, unlockedAt: '2026-10-01T00:00:00.000Z' })))
  mocks.countCompletedFocusSessions.mockResolvedValue(sessions)
  mocks.countStepGoalDaysMet.mockResolvedValue(goalDays)
  await useBiomeStore.getState().load()
}

describe('biomeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.comingSoon.clear()
    useBiomeStore.setState({ homeBiome: null, homeSource: 'picked', currentBiome: null, purchased: [], earned: 0, spent: 0, loaded: false })
  })

  describe('load', () => {
    it('has no progress until a home biome is set', async () => {
      await loadWith({ home: null })
      expect(useBiomeStore.getState().loaded).toBe(true)
      expect(selectBiomeProgress(useBiomeStore.getState())).toBeNull()
      expect(activeBiome()).toBe('atlantic-forest')
    })

    it('derives the balance from completed sessions and step goals minus unlock costs', async () => {
      await loadWith({ sessions: 12, goalDays: 3, unlocks: [{ biomeId: 'caatinga', cost: 100 }] })
      expect(selectBiomeProgress(useBiomeStore.getState())).toEqual({
        home: 'atlantic-forest',
        current: 'atlantic-forest',
        purchased: ['caatinga'],
        balance: 50,
      })
    })

    it('keeps a stored current biome only while it is unlocked', async () => {
      await loadWith({ current: 'caatinga', unlocks: [{ biomeId: 'caatinga', cost: 100 }] })
      expect(activeBiome()).toBe('caatinga')

      await loadWith({ current: 'caatinga' })
      expect(activeBiome()).toBe('atlantic-forest')
    })
  })

  describe('detectHome', () => {
    it('sets a playable detected biome as home and current, keeping only its id', async () => {
      await loadWith({ home: null })
      mocks.getApproximatePosition.mockResolvedValue({ lat: -9.39, lng: -40.5 })
      mocks.biomeAt.mockReturnValue('caatinga')

      expect(await useBiomeStore.getState().detectHome()).toEqual({ outcome: 'detected', biome: 'caatinga' })
      expect(mocks.setHomeBiome).toHaveBeenCalledWith('caatinga', 'detected')
      expect(mocks.setCurrentBiome).toHaveBeenCalledWith('caatinga')
      expect(JSON.stringify(useBiomeStore.getState())).not.toContain('-9.39')
    })

    it('falls back to the picker when location fails or is denied', async () => {
      mocks.getApproximatePosition.mockRejectedValue(new Error('Location permission was denied'))
      expect(await useBiomeStore.getState().detectHome()).toEqual({ outcome: 'unavailable' })
      expect(mocks.setHomeBiome).not.toHaveBeenCalled()
    })

    it('does not set a home outside the supported biomes or in one without species yet', async () => {
      mocks.getApproximatePosition.mockResolvedValue({ lat: 0, lng: 0 })

      mocks.biomeAt.mockReturnValue('unsupported')
      expect(await useBiomeStore.getState().detectHome()).toEqual({ outcome: 'unsupported' })

      mocks.comingSoon.add('cerrado')
      mocks.biomeAt.mockReturnValue('cerrado')
      expect(await useBiomeStore.getState().detectHome()).toEqual({ outcome: 'coming-soon', biome: 'cerrado' })

      expect(mocks.setHomeBiome).not.toHaveBeenCalled()
    })
  })

  describe('setHome', () => {
    it('makes the first home current', async () => {
      await loadWith({ home: null })
      await useBiomeStore.getState().setHome('caatinga')

      expect(mocks.setCurrentBiome).toHaveBeenCalledWith('caatinga')
      expect(selectBiomeProgress(useBiomeStore.getState())).toMatchObject({ home: 'caatinga', current: 'caatinga' })
      expect(mocks.addBiomeUnlock).not.toHaveBeenCalled()
    })

    it('keeps a former detected home unlocked as a free unlock and leaves the current biome unchanged', async () => {
      await loadWith({ home: 'atlantic-forest', source: 'detected' })
      mocks.getApproximatePosition.mockResolvedValue({ lat: -8.05, lng: -34.9 })
      mocks.biomeAt.mockReturnValue('caatinga')
      await useBiomeStore.getState().detectHome()

      expect(mocks.addBiomeUnlock).toHaveBeenCalledWith('atlantic-forest', 0)
      expect(mocks.setCurrentBiome).not.toHaveBeenCalled()
      expect(selectBiomeProgress(useBiomeStore.getState())).toEqual({
        home: 'caatinga',
        current: 'atlantic-forest',
        purchased: ['atlantic-forest'],
        balance: 0,
      })
    })

    it('does not refund or re-record a home that was already unlocked', async () => {
      await loadWith({
        home: 'atlantic-forest',
        source: 'detected',
        sessions: 10,
        unlocks: [{ biomeId: 'caatinga', cost: 100 }],
      })
      await useBiomeStore.getState().setHome('caatinga', 'detected')
      await useBiomeStore.getState().setHome('atlantic-forest', 'detected')

      expect(mocks.addBiomeUnlock).toHaveBeenCalledTimes(1)
      expect(mocks.addBiomeUnlock).toHaveBeenCalledWith('atlantic-forest', 0)
      expect(selectBiomeProgress(useBiomeStore.getState())).toMatchObject({
        home: 'atlantic-forest',
        purchased: ['caatinga', 'atlantic-forest'],
        balance: 0,
      })
    })

    it('does not keep a picked home unlocked once replaced (coming-soon user in Brasília)', async () => {
      mocks.comingSoon.add('cerrado')
      mocks.getApproximatePosition.mockResolvedValue({ lat: -15.8, lng: -47.9 })
      mocks.biomeAt.mockReturnValue('cerrado')
      await loadWith({ home: null })

      expect(await useBiomeStore.getState().detectHome()).toEqual({ outcome: 'coming-soon', biome: 'cerrado' })
      await useBiomeStore.getState().setHome('atlantic-forest')
      expect(await useBiomeStore.getState().detectHome()).toEqual({ outcome: 'coming-soon', biome: 'cerrado' })
      await useBiomeStore.getState().setHome('caatinga')

      expect(mocks.addBiomeUnlock).not.toHaveBeenCalled()
      expect(mocks.setHomeBiome).toHaveBeenLastCalledWith('caatinga', 'picked')
      expect(selectBiomeProgress(useBiomeStore.getState())).toEqual({
        home: 'caatinga',
        current: 'caatinga',
        purchased: [],
        balance: 0,
      })
    })

    it('treats a home stored before its source was recorded as picked', async () => {
      await loadWith({ home: 'atlantic-forest', current: 'atlantic-forest' })
      await useBiomeStore.getState().setHome('caatinga', 'detected')

      expect(mocks.addBiomeUnlock).not.toHaveBeenCalled()
      expect(activeBiome()).toBe('caatinga')
    })

    it('ignores biomes without a catalog', async () => {
      mocks.comingSoon.add('pampa')
      await useBiomeStore.getState().setHome('pampa')
      expect(mocks.setHomeBiome).not.toHaveBeenCalled()
    })
  })

  describe('unlock', () => {
    it('spends points on a neighbouring biome', async () => {
      await loadWith({ sessions: 10 })
      expect(await useBiomeStore.getState().unlock('caatinga')).toBe(true)

      expect(mocks.addBiomeUnlock).toHaveBeenCalledWith('caatinga', NEIGHBOUR_UNLOCK_COST)
      const progress = selectBiomeProgress(useBiomeStore.getState())!
      expect(progress.purchased).toEqual(['caatinga'])
      expect(progress.balance).toBe(0)
    })

    it('buys at most once under concurrent calls and never overspends', async () => {
      await loadWith({ home: 'cerrado', sessions: 10 })
      let finish!: () => void
      mocks.addBiomeUnlock.mockReturnValueOnce(new Promise<void>((resolve) => (finish = resolve)))

      const calls = [
        useBiomeStore.getState().unlock('caatinga'),
        useBiomeStore.getState().unlock('caatinga'),
        useBiomeStore.getState().unlock('atlantic-forest'),
      ]
      finish()

      expect(await Promise.all(calls)).toEqual([true, false, false])
      expect(mocks.addBiomeUnlock).toHaveBeenCalledTimes(1)
      expect(selectBiomeProgress(useBiomeStore.getState())!.balance).toBe(0)
    })

    it('rolls back when saving the unlock fails', async () => {
      await loadWith({ sessions: 10 })
      mocks.addBiomeUnlock.mockRejectedValueOnce(new Error('disk full'))

      expect(await useBiomeStore.getState().unlock('caatinga')).toBe(false)
      expect(selectBiomeProgress(useBiomeStore.getState())).toMatchObject({ purchased: [], balance: 100 })
    })

    it('refuses when the balance is short', async () => {
      await loadWith({ sessions: 9 })
      expect(await useBiomeStore.getState().unlock('caatinga')).toBe(false)
      expect(mocks.addBiomeUnlock).not.toHaveBeenCalled()
    })
  })

  describe('switchTo', () => {
    it('switches only to an unlocked biome', async () => {
      await loadWith()
      expect(await useBiomeStore.getState().switchTo('caatinga')).toBe(false)
      expect(mocks.setCurrentBiome).not.toHaveBeenCalled()

      await loadWith({ unlocks: [{ biomeId: 'caatinga', cost: 100 }] })
      expect(await useBiomeStore.getState().switchTo('caatinga')).toBe(true)
      expect(mocks.setCurrentBiome).toHaveBeenCalledWith('caatinga')
      expect(activeBiome()).toBe('caatinga')
    })
  })
})
