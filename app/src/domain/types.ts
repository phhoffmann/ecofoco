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

/** The session that is running right now, persisted so it survives the process being killed. */
export interface ActiveFocusSession {
  startedAt: string
  plannedDurationSeconds: number
  /** The Plant the Sprout grows into; collected only if the session completes. */
  speciesId: string
}

export interface DailyProgress {
  date: string
  steps: number
  goalMet: boolean
  drawCompleted: boolean
}

export const DEFAULT_STEP_GOAL = 6000

/** How the Collection tab is shown: the full Pokédex grid, or the isometric garden for a period. */
export type CollectionView = 'grid' | 'isometric'

export const DEFAULT_COLLECTION_VIEW: CollectionView = 'grid'

/** Animation level: follow the device's reduce-motion setting, or override it either way. */
export type MotionPreference = 'system' | 'reduce' | 'full'

/** The "Display & feedback" settings: only choices users genuinely disagree on. */
export interface DisplayPreferences {
  /** Full-screen reveal for each catch; off shows a small snackbar instead. */
  celebrations: boolean
  haptics: boolean
  motion: MotionPreference
  /** The running-session pill shown on tabs other than Focus. */
  timerPill: boolean
}

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  celebrations: true,
  haptics: true,
  motion: 'system',
  timerPill: true,
}
