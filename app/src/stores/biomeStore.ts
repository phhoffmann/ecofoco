import { create } from 'zustand'
import { addBiomeUnlock, listBiomeUnlocks } from '../data/biomeUnlockRepo'
import { countStepGoalDaysMet } from '../data/dailyProgressRepo'
import { loadEcoregionGrid } from '../data/ecoregionGrid'
import { countCompletedFocusSessions } from '../data/focusSessionRepo'
import { getApproximatePosition } from '../data/location'
import { getCurrentBiome, getHomeBiome, setCurrentBiome, setHomeBiome } from '../data/settingsRepo'
import {
  FALLBACK_BIOME,
  NEIGHBOUR_UNLOCK_COST,
  canSwitchTo,
  canUnlock,
  earnedPoints,
  hasCatalog,
  unlockedBiomes,
  type BiomeId,
  type BiomeProgress,
} from '../domain/biome'
import { biomeAt } from '../domain/biomeLookup'

export type DetectResult =
  | { outcome: 'detected'; biome: BiomeId }
  | { outcome: 'coming-soon'; biome: BiomeId }
  | { outcome: 'unsupported' }
  | { outcome: 'unavailable' }

interface BiomeState {
  homeBiome: BiomeId | null
  currentBiome: BiomeId | null
  purchased: BiomeId[]
  earned: number
  spent: number
  loaded: boolean
  load: () => Promise<void>
  /** Coarse location → Biome. Sets it as home only when it is playable; otherwise the caller offers the picker. */
  detectHome: () => Promise<DetectResult>
  /** Home from detection or the manual picker. Free and unlocked; the first home also becomes current. A former home stays unlocked. */
  setHome: (biome: BiomeId) => Promise<void>
  unlock: (biome: BiomeId) => Promise<boolean>
  switchTo: (biome: BiomeId) => Promise<boolean>
}

/** Null until a home Biome is set (onboarding). */
export function selectBiomeProgress(state: BiomeState): BiomeProgress | null {
  if (!state.homeBiome) return null
  return {
    home: state.homeBiome,
    current: state.currentBiome ?? state.homeBiome,
    purchased: state.purchased,
    balance: state.earned - state.spent,
  }
}

const selectActiveBiome = (state: BiomeState): BiomeId => state.currentBiome ?? state.homeBiome ?? FALLBACK_BIOME

/** The Biome rewards are drawn from right now. */
export function activeBiome(): BiomeId {
  return selectActiveBiome(useBiomeStore.getState())
}

export function useActiveBiome(): BiomeId {
  return useBiomeStore(selectActiveBiome)
}

export const useBiomeStore = create<BiomeState>((set, get) => ({
  homeBiome: null,
  currentBiome: null,
  purchased: [],
  earned: 0,
  spent: 0,
  loaded: false,

  load: async () => {
    const [homeBiome, storedCurrent, unlocks, sessions, goalDays] = await Promise.all([
      getHomeBiome(),
      getCurrentBiome(),
      listBiomeUnlocks(),
      countCompletedFocusSessions(),
      countStepGoalDaysMet(),
    ])
    const purchased = unlocks.map((u) => u.biomeId)
    const unlocked = homeBiome ? unlockedBiomes({ home: homeBiome, purchased }) : new Set<BiomeId>()
    const currentBiome =
      storedCurrent && unlocked.has(storedCurrent) && hasCatalog(storedCurrent) ? storedCurrent : homeBiome
    set({
      homeBiome,
      currentBiome,
      purchased,
      earned: earnedPoints(sessions, goalDays),
      spent: unlocks.reduce((sum, u) => sum + u.cost, 0),
      loaded: true,
    })
  },

  detectHome: async () => {
    let biome: BiomeId | 'unsupported'
    try {
      const [position, grid] = await Promise.all([getApproximatePosition(), loadEcoregionGrid()])
      biome = biomeAt(grid, position.lat, position.lng)
    } catch {
      // Permission denied, location off, timeout, or the map failed to load: all fall back to the picker.
      return { outcome: 'unavailable' }
    }
    if (biome === 'unsupported') return { outcome: 'unsupported' }
    if (!hasCatalog(biome)) return { outcome: 'coming-soon', biome }
    await get().setHome(biome)
    return { outcome: 'detected', biome }
  },

  setHome: async (biome) => {
    if (!hasCatalog(biome)) return
    const { homeBiome: previous, purchased } = get()
    if (previous && previous !== biome && !purchased.includes(previous)) {
      await addBiomeUnlock(previous, 0)
      set((s) => ({ purchased: [...s.purchased, previous] }))
    }
    await setHomeBiome(biome)
    if (!previous) {
      await setCurrentBiome(biome)
      set({ homeBiome: biome, currentBiome: biome })
    } else {
      set({ homeBiome: biome })
    }
  },

  unlock: async (biome) => {
    const progress = selectBiomeProgress(get())
    if (!progress || !canUnlock(biome, progress)) return false
    set((s) => ({ purchased: [...s.purchased, biome], spent: s.spent + NEIGHBOUR_UNLOCK_COST }))
    try {
      await addBiomeUnlock(biome, NEIGHBOUR_UNLOCK_COST)
      return true
    } catch {
      set((s) => ({ purchased: s.purchased.filter((b) => b !== biome), spent: s.spent - NEIGHBOUR_UNLOCK_COST }))
      return false
    }
  },

  switchTo: async (biome) => {
    const progress = selectBiomeProgress(get())
    if (!progress || !canSwitchTo(biome, progress)) return false
    await setCurrentBiome(biome)
    set({ currentBiome: biome })
    return true
  },
}))
