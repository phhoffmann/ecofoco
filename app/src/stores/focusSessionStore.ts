import { create } from 'zustand'
import { canTellScreenOffFromAppSwitch, onAppStateChange, timeInOtherAppsMs } from '../data/appLifecycle'
import { addCollectedEntry } from '../data/collectionRepo'
import { recordFocusSession } from '../data/focusSessionRepo'
import { pickRandomSpecies } from '../domain/draw'
import { computeRemainingSeconds, hasLeftTooLong } from '../domain/focusSession'
import type { Species } from '../domain/species'
import { activeBiome } from './biomeStore'
import { useCelebrationStore } from './celebrationStore'

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

// How often to re-check time in other apps while backgrounded, so leaving fails promptly
// even if the user never comes back.
const AWAY_CHECK_INTERVAL_MS = 1_000

let startedAt = 0
let tickHandle: ReturnType<typeof setInterval> | null = null
let awayCheckHandle: ReturnType<typeof setInterval> | null = null
let backgroundedThisSession = false

function clearTick() {
  if (tickHandle !== null) {
    clearInterval(tickHandle)
    tickHandle = null
  }
}

function clearAwayCheck() {
  if (awayCheckHandle !== null) {
    clearInterval(awayCheckHandle)
    awayCheckHandle = null
  }
}

async function failIfLeftTooLong(): Promise<void> {
  if (useFocusSessionStore.getState().status !== 'running') return
  if (hasLeftTooLong(await timeInOtherAppsMs())) await useFocusSessionStore.getState().fail()
}

export const useFocusSessionStore = create<FocusSessionState>((set, get) => ({
  status: 'idle',
  plannedDurationSeconds: 0,
  remainingSeconds: 0,
  resultSpecies: null,

  start: (durationSeconds) => {
    clearTick()
    clearAwayCheck()
    startedAt = Date.now()
    backgroundedThisSession = false
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
        // Timers can stall in the background: don't let a timer that ran out while the user
        // was in another app complete the session before the away check fails it.
        if (backgroundedThisSession) await failIfLeftTooLong()
        if (get().status !== 'running') return
        clearAwayCheck()
        const species = pickRandomSpecies('plant', activeBiome())
        await addCollectedEntry(species.id, 'focus_session')
        await recordFocusSession(new Date(startedAt).toISOString(), durationSeconds, 'completed')
        set({ status: 'completed', resultSpecies: species })
        useCelebrationStore.getState().celebrate(species)
      }
    }, 250)
  },

  fail: async () => {
    const { status, plannedDurationSeconds } = get()
    if (status !== 'running') return
    clearTick()
    clearAwayCheck()
    // Flip the status before awaiting, so concurrent callers can't record the failure twice.
    set({ status: 'failed', remainingSeconds: 0 })
    await recordFocusSession(new Date(startedAt).toISOString(), plannedDurationSeconds, 'failed')
  },

  reset: () => {
    clearTick()
    clearAwayCheck()
    set({ status: 'idle', plannedDurationSeconds: 0, remainingSeconds: 0, resultSpecies: null })
  },
}))

// Turning the screen off or locking the phone keeps the session running; only time spent in
// other apps beyond the grace period fails it. Builds that can't tell the two apart (web/dev)
// fail as soon as the app is backgrounded.
onAppStateChange((isActive) => {
  const { status, fail } = useFocusSessionStore.getState()
  if (status !== 'running') return

  if (!canTellScreenOffFromAppSwitch()) {
    if (!isActive) void fail()
    return
  }

  if (isActive) {
    clearAwayCheck()
    void failIfLeftTooLong()
  } else {
    backgroundedThisSession = true
    clearAwayCheck()
    awayCheckHandle = setInterval(() => void failIfLeftTooLong(), AWAY_CHECK_INTERVAL_MS)
  }
})
