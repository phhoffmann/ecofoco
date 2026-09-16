import { create } from 'zustand'
import { onAppBackgrounded } from '../data/appLifecycle'
import { addCollectedEntry } from '../data/collectionRepo'
import { recordFocusSession } from '../data/focusSessionRepo'
import { allowScreenSleep, keepScreenAwake } from '../data/screenWakeLock'
import { pickRandomSpecies } from '../domain/draw'
import { computeRemainingSeconds } from '../domain/focusSession'
import type { Species } from '../domain/species'

export type FocusSessionStatus = 'idle' | 'running' | 'completed' | 'failed'

interface FocusSessionState {
  status: FocusSessionStatus
  plannedDurationSeconds: number
  remainingSeconds: number
  resultSpecies: Species | null
  start: (durationSeconds: number) => void
  fail: () => Promise<void>
  reset: () => void
}

let startedAt = 0
let tickHandle: ReturnType<typeof setInterval> | null = null

function clearTick() {
  if (tickHandle !== null) {
    clearInterval(tickHandle)
    tickHandle = null
  }
}

export const useFocusSessionStore = create<FocusSessionState>((set, get) => ({
  status: 'idle',
  plannedDurationSeconds: 0,
  remainingSeconds: 0,
  resultSpecies: null,

  start: (durationSeconds) => {
    clearTick()
    startedAt = Date.now()
    void keepScreenAwake()
    set({
      status: 'running',
      plannedDurationSeconds: durationSeconds,
      remainingSeconds: durationSeconds,
      resultSpecies: null,
    })

    tickHandle = setInterval(async () => {
      const remaining = computeRemainingSeconds(startedAt, durationSeconds, Date.now())
      set({ remainingSeconds: remaining })

      if (remaining === 0) {
        clearTick()
        void allowScreenSleep()
        const species = pickRandomSpecies('plant')
        await addCollectedEntry(species.id, 'focus_session')
        await recordFocusSession(new Date(startedAt).toISOString(), durationSeconds, 'completed')
        set({ status: 'completed', resultSpecies: species })
      }
    }, 250)
  },

  fail: async () => {
    const { status, plannedDurationSeconds } = get()
    if (status !== 'running') return
    clearTick()
    void allowScreenSleep()
    await recordFocusSession(new Date(startedAt).toISOString(), plannedDurationSeconds, 'failed')
    set({ status: 'failed', remainingSeconds: 0 })
  },

  reset: () => {
    clearTick()
    set({ status: 'idle', plannedDurationSeconds: 0, remainingSeconds: 0, resultSpecies: null })
  },
}))

onAppBackgrounded(() => {
  void useFocusSessionStore.getState().fail()
})
