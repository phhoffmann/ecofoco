import { create } from 'zustand'
import { canTellScreenOffFromAppSwitch, onAppStateChange, timeInOtherAppsMs } from '../data/appLifecycle'
import {
  completeFocusSession,
  failFocusSession,
  getActiveFocusSession,
  saveActiveFocusSession,
} from '../data/focusSessionRepo'
import { FOCUS_SESSION_POINTS } from '../domain/biome'
import { pickRandomSpecies } from '../domain/draw'
import { computeRemainingSeconds, hasLeftTooLong } from '../domain/focusSession'
import { SPECIES_CATALOG, type PlantArchetype, type Species } from '../domain/species'
import type { ActiveFocusSession, FocusFailReason } from '../domain/types'
import { activeBiome } from './biomeStore'
import { useCollectionStore } from './collectionStore'

export type FocusSessionStatus = 'idle' | 'running' | 'completed' | 'failed'

interface FocusSessionState {
  status: FocusSessionStatus
  plannedDurationSeconds: number
  remainingSeconds: number
  /** Shape the Sprout grows into while running: the archetype of the plant this session will collect. */
  growingArchetype: PlantArchetype | null
  resultSpecies: Species | null
  /** Why the last session failed, for the failure copy. */
  failReason: FocusFailReason | null
  start: (durationSeconds: number) => Promise<void>
  fail: (reason: FocusFailReason) => Promise<void>
  /** On launch: resume a session the process died during, or fail it if its time ran out meanwhile. */
  recover: () => Promise<void>
  reset: () => void
}

// How often to re-check time in other apps while backgrounded, so leaving fails promptly
// even if the user never comes back.
const AWAY_CHECK_INTERVAL_MS = 1_000

let active: ActiveFocusSession | null = null
// The session's end is written only after its start, so ending it can't be undone by a late save.
let saving: Promise<void> = Promise.resolve()
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
  if (hasLeftTooLong(await timeInOtherAppsMs())) await useFocusSessionStore.getState().fail('left_app')
}

const IDLE = {
  status: 'idle',
  plannedDurationSeconds: 0,
  remainingSeconds: 0,
  growingArchetype: null,
  resultSpecies: null,
  failReason: null,
} as const

export const useFocusSessionStore = create<FocusSessionState>((set, get) => {
  /** Runs the session's clock from its wall-clock start, whether just started or recovered. */
  function run(session: ActiveFocusSession, species: Species) {
    clearTick()
    clearAwayCheck()
    active = session
    backgroundedThisSession = false
    const startedAt = Date.parse(session.startedAt)
    const tick = () => computeRemainingSeconds(startedAt, session.plannedDurationSeconds, Date.now())
    set({
      status: 'running',
      plannedDurationSeconds: session.plannedDurationSeconds,
      remainingSeconds: tick(),
      growingArchetype: species.archetype as PlantArchetype,
      resultSpecies: null,
      failReason: null,
    })

    tickHandle = setInterval(async () => {
      const remaining = tick()
      set({ remainingSeconds: remaining })
      if (remaining > 0) return

      clearTick()
      // Timers can stall in the background: don't let a timer that ran out while the user
      // was in another app complete the session before the away check fails it.
      if (backgroundedThisSession) await failIfLeftTooLong()
      if (get().status !== 'running') return
      clearAwayCheck()
      active = null
      await saving.catch(() => {})
      await completeFocusSession(session)
      set({ status: 'completed', resultSpecies: species })
      await useCollectionStore.getState().reveal(species, FOCUS_SESSION_POINTS)
    }, 250)
  }

  return {
    ...IDLE,

    start: async (durationSeconds) => {
      // Drawn up front so the Sprout can grow into its shape; only collected if the session completes.
      const species = pickRandomSpecies('plant', activeBiome())
      const session = { startedAt: new Date().toISOString(), plannedDurationSeconds: durationSeconds, speciesId: species.id }
      run(session, species)
      saving = saveActiveFocusSession(session)
      await saving
    },

    fail: async (reason) => {
      if (get().status !== 'running' || !active) return
      const session = active
      active = null
      clearTick()
      clearAwayCheck()
      // Flip the status before awaiting, so concurrent callers can't record the failure twice.
      set({ status: 'failed', remainingSeconds: 0, failReason: reason })
      await saving.catch(() => {})
      await failFocusSession(session.startedAt, session.plannedDurationSeconds, reason)
    },

    recover: async () => {
      if (get().status !== 'idle') return
      const session = await getActiveFocusSession()
      if (!session || get().status !== 'idle') return
      const species = SPECIES_CATALOG.find((s) => s.id === session.speciesId && s.type === 'plant')
      const remaining = computeRemainingSeconds(Date.parse(session.startedAt), session.plannedDurationSeconds, Date.now())
      if (species && remaining > 0) {
        run(session, species)
        return
      }
      // Its time ran out while the process was dead, so nobody saw it through: it can't count as
      // completed. A species dropped from the catalog can't be grown either.
      set({ ...IDLE, status: 'failed', plannedDurationSeconds: session.plannedDurationSeconds, failReason: 'closed' })
      await failFocusSession(session.startedAt, session.plannedDurationSeconds, 'closed')
    },

    reset: () => {
      clearTick()
      clearAwayCheck()
      active = null
      set(IDLE)
    },
  }
})

// Turning the screen off or locking the phone keeps the session running; only time spent in
// other apps beyond the grace period fails it. Builds that can't tell the two apart (web/dev)
// fail as soon as the app is backgrounded.
onAppStateChange((isActive) => {
  const { status, fail } = useFocusSessionStore.getState()
  if (status !== 'running') return

  if (!canTellScreenOffFromAppSwitch()) {
    if (!isActive) void fail('left_app')
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
