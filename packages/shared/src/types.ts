export type CollectionMethod = 'focus_session' | 'draw' | 'manual_sighting' | 'photo_ai'

export interface CollectedEntry {
  id: string
  speciesId: string
  collectedAt: string
  method: CollectionMethod
}

export type FocusSessionStatus = 'completed' | 'failed'

/** Why a FocusSession failed: the user held Give up, stayed in another app, or the app was closed before it ended. */
export type FocusFailReason = 'gave_up' | 'left_app' | 'closed'

export interface FocusSession {
  id: string
  startedAt: string
  endedAt: string
  plannedDurationSeconds: number
  status: FocusSessionStatus
  /** Set only on failed sessions; null on completed ones and on failures recorded before reasons existed. */
  failReason: FocusFailReason | null
}

export interface DailyProgress {
  date: string
  steps: number
  goalMet: boolean
  drawCompleted: boolean
}

export const DEFAULT_STEP_GOAL = 6000
