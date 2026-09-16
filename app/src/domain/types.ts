export type CollectionMethod = 'focus_session' | 'draw' | 'manual_sighting' | 'photo_ai'

export interface CollectedEntry {
  id: string
  speciesId: string
  collectedAt: string
  method: CollectionMethod
}

export type FocusSessionStatus = 'completed' | 'failed'

export interface FocusSession {
  id: string
  startedAt: string
  endedAt: string
  plannedDurationSeconds: number
  status: FocusSessionStatus
}

export interface DailyProgress {
  date: string
  steps: number
  goalMet: boolean
  drawCompleted: boolean
}

export const DEFAULT_STEP_GOAL = 6000
