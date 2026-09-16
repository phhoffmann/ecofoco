import { create } from 'zustand'
import { addCollectedEntry } from '../data/collectionRepo'
import { getTodayProgress, markDrawCompleted, upsertTodaySteps } from '../data/dailyProgressRepo'
import {
  getTodaySteps,
  isHealthAvailable,
  isStepsAuthorized,
  requestStepsAuthorization,
  writeTestSteps,
} from '../data/stepProvider'
import { canDraw } from '../domain/dailyProgress'
import { pickRandomSpecies } from '../domain/draw'
import type { Species } from '../domain/species'
import type { DailyProgress } from '../domain/types'
import { useSettingsStore } from './settingsStore'

interface DailyProgressState {
  healthAvailable: boolean | null
  authorized: boolean
  progress: DailyProgress
  resultSpecies: Species | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  connect: () => Promise<void>
  draw: () => Promise<void>
  clearResult: () => void
  simulateSteps: (count: number) => Promise<void>
}

export const useDailyProgressStore = create<DailyProgressState>((set, get) => ({
  healthAvailable: null,
  authorized: false,
  progress: { date: '', steps: 0, goalMet: false, drawCompleted: false },
  resultSpecies: null,
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null })
    try {
      const available = await isHealthAvailable()
      const authorized = available && (await isStepsAuthorized())
      set({ healthAvailable: available, authorized })

      if (authorized) {
        const steps = await getTodaySteps()
        const progress = await upsertTodaySteps(steps, useSettingsStore.getState().stepGoal)
        set({ progress, loading: false })
      } else {
        const progress = await getTodayProgress()
        set({ progress, loading: false })
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false })
    }
  },

  connect: async () => {
    set({ loading: true, error: null })
    try {
      const granted = await requestStepsAuthorization()
      set({ authorized: granted, loading: false })
      if (granted) await get().refresh()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false })
    }
  },

  draw: async () => {
    const { progress } = get()
    if (!canDraw(progress)) return
    const species = pickRandomSpecies('animal')
    await addCollectedEntry(species.id, 'draw')
    await markDrawCompleted()
    const updated = await getTodayProgress()
    set({ progress: updated, resultSpecies: species })
  },

  clearResult: () => set({ resultSpecies: null }),

  simulateSteps: async (count) => {
    set({ loading: true, error: null })
    try {
      await writeTestSteps(count)
      set({ authorized: true })
      await get().refresh()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false })
    }
  },
}))
