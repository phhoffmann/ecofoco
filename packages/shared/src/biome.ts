// IBGE's six Brazilian biomes. Which of them are playable comes from the app's catalog, not from this list.
export const BIOME_IDS = ['amazon', 'atlantic-forest', 'caatinga', 'cerrado', 'pantanal', 'pampa'] as const
export type BiomeId = (typeof BIOME_IDS)[number]

/** Biomes that share a land border inside Brazil. Symmetric. */
export const BIOME_NEIGHBOURS: Readonly<Record<BiomeId, readonly BiomeId[]>> = {
  amazon: ['cerrado'],
  'atlantic-forest': ['cerrado', 'caatinga', 'pampa'],
  caatinga: ['cerrado', 'atlantic-forest'],
  cerrado: ['amazon', 'atlantic-forest', 'caatinga', 'pantanal'],
  pantanal: ['cerrado'],
  pampa: ['atlantic-forest'],
}

export const FOCUS_MINUTE_POINTS = 1 // per minute of a completed FocusSession's planned duration
export const STEP_GOAL_POINTS = 20 // per day the StepGoal was met
export const NEIGHBOUR_UNLOCK_COST = 250 // points to unlock one neighbouring Biome

export function isBiomeId(value: unknown): value is BiomeId {
  return (BIOME_IDS as readonly unknown[]).includes(value)
}

/** What a completed FocusSession earns. Each award is recorded with its session, so changing this never rewrites past ones. */
export function focusSessionPoints(plannedDurationSeconds: number): number {
  return Math.floor(plannedDurationSeconds / 60) * FOCUS_MINUTE_POINTS
}

/** A detected home is where the user lives; a picked one is a stand-in that does not stay unlocked once replaced. */
export type HomeBiomeSource = 'detected' | 'picked'

/** Where the user stands with Biomes: home (detected or picked) plus Biomes bought with points. */
export interface BiomeProgress {
  home: BiomeId
  current: BiomeId
  purchased: BiomeId[]
  balance: number
}

/** Whether a Biome has species to play with. The catalog lives in the app, so callers pass this in. */
export type IsPlayable = (biome: BiomeId) => boolean

export function unlockedBiomes(progress: Pick<BiomeProgress, 'home' | 'purchased'>): Set<BiomeId> {
  return new Set([progress.home, ...progress.purchased])
}

export type BiomeStatus = 'current' | 'unlocked' | 'unlockable' | 'locked' | 'coming-soon'

export function biomeStatus(biome: BiomeId, progress: BiomeProgress, isPlayable: IsPlayable): BiomeStatus {
  if (biome === progress.current) return 'current'
  if (!isPlayable(biome)) return 'coming-soon'
  const unlocked = unlockedBiomes(progress)
  if (unlocked.has(biome)) return 'unlocked'
  const bordersUnlocked = BIOME_NEIGHBOURS[biome].some((n) => unlocked.has(n))
  return bordersUnlocked ? 'unlockable' : 'locked'
}

/** A neighbour of any unlocked Biome can be bought once the balance covers its cost. */
export function canUnlock(biome: BiomeId, progress: BiomeProgress, isPlayable: IsPlayable): boolean {
  return biomeStatus(biome, progress, isPlayable) === 'unlockable' && progress.balance >= NEIGHBOUR_UNLOCK_COST
}

export function canSwitchTo(biome: BiomeId, progress: BiomeProgress, isPlayable: IsPlayable): boolean {
  return biomeStatus(biome, progress, isPlayable) === 'unlocked'
}
