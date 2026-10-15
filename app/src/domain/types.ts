import type { BiomeId } from './biome'

export {
  DEFAULT_STEP_GOAL,
  type CollectedEntry,
  type CollectionMethod,
  type DailyProgress,
  type FocusFailReason,
  type FocusSession,
  type FocusSessionStatus,
} from '@ecofoco/shared'

/** The session that is running right now, persisted so it survives the process being killed. */
export interface ActiveFocusSession {
  startedAt: string
  plannedDurationSeconds: number
  /** The Plant the Sprout grows into; collected only if the session completes. */
  speciesId: string
  /** The Biome the Plant was drawn from, active when the session started. */
  biomeId: BiomeId
  /** Set while the app is in the background mid-session: when it left, and whether the screen was on then. */
  backgrounded?: { at: string; screenOn: boolean }
}

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
