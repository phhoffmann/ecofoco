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
import type { DailyProgress } from '../domain/types'
import { activeBiome } from './biomeStore'
import { useCollectionStore } from './collectionStore'
import { useSettingsStore } from './settingsStore'

interface DailyProgressState {
  healthAvailable: boolean | null
  authorized: boolean
  progress: DailyProgress
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  connect: () => Promise<void>
  draw: () => Promise<void>
  simulateSteps: (count: number) => Promise<void>
}

export const useDailyProgressStore = create<DailyProgressState>((set, get) => {
  /** Runs a Health Connect task with the loading flag up, keeping any failure as the error to show. */
  async function withLoading(task: () => Promise<void>) {
    set({ loading: true, error: null })
    try {
      await task()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) })
    } finally {
      set({ loading: false })
    }
  }

  return {
    healthAvailable: null,
    authorized: false,
    progress: { date: '', steps: 0, goalMet: false, drawCompleted: false },
    loading: false,
    error: null,

    refresh: () =>
      withLoading(async () => {
        const available = await isHealthAvailable()
        const authorized = available && (await isStepsAuthorized())
        set({ healthAvailable: available, authorized })
        const progress = authorized
          ? await upsertTodaySteps(await getTodaySteps(), useSettingsStore.getState().stepGoal)
          : await getTodayProgress()
        set({ progress })
      }),

    connect: () =>
      withLoading(async () => {
        const granted = await requestStepsAuthorization()
        set({ authorized: granted })
        if (granted) await get().refresh()
      }),

    draw: async () => {
      const { progress } = get()
      if (!canDraw(progress)) return
      const species = pickRandomSpecies('animal', activeBiome())
      await addCollectedEntry(species.id, 'draw')
      await markDrawCompleted()
      set({ progress: await getTodayProgress() })
      // A Draw earns no points itself: the day's points come from meeting the StepGoal.
      await useCollectionStore.getState().reveal(species, 0)
    },

    simulateSteps: (count) =>
      withLoading(async () => {
        await writeTestSteps(count)
        set({ authorized: true })
        await get().refresh()
      }),
  }
})
