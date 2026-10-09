import { BIOME_IDS, type BiomeId } from './catalogSchema'
import { SPECIES_CATALOG, speciesOfBiome, type Species } from './species'

export { BIOME_IDS, type BiomeId } from './catalogSchema'

/** Biomes that share a land border inside Brazil. Symmetric. */
export const BIOME_NEIGHBOURS: Readonly<Record<BiomeId, readonly BiomeId[]>> = {
  amazon: ['cerrado'],
  'atlantic-forest': ['cerrado', 'caatinga', 'pampa'],
  caatinga: ['cerrado', 'atlantic-forest'],
  cerrado: ['amazon', 'atlantic-forest', 'caatinga', 'pantanal'],
  pantanal: ['cerrado'],
  pampa: ['atlantic-forest'],
}

// The original catalog's Biome, used only if a reward is drawn before onboarding picked a home.
export const FALLBACK_BIOME: BiomeId = 'atlantic-forest'

export const FOCUS_SESSION_POINTS = 10 // per completed FocusSession
export const STEP_GOAL_POINTS = 10 // per day the StepGoal was met
export const NEIGHBOUR_UNLOCK_COST = 100 // points to unlock one neighbouring Biome

export function isBiomeId(value: unknown): value is BiomeId {
  return (BIOME_IDS as readonly unknown[]).includes(value)
}

/** A Biome is playable once the catalog has plants and animals for it; the rest show as "coming soon". */
export function hasCatalog(biome: BiomeId, catalog: Species[] = SPECIES_CATALOG): boolean {
  const inBiome = speciesOfBiome(biome, catalog)
  return inBiome.some((s) => s.type === 'plant') && inBiome.some((s) => s.type === 'animal')
}

export function earnedPoints(completedFocusSessions: number, stepGoalDaysMet: number): number {
  return completedFocusSessions * FOCUS_SESSION_POINTS + stepGoalDaysMet * STEP_GOAL_POINTS
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

export function unlockedBiomes(progress: Pick<BiomeProgress, 'home' | 'purchased'>): Set<BiomeId> {
  return new Set([progress.home, ...progress.purchased])
}

export type BiomeStatus = 'current' | 'unlocked' | 'unlockable' | 'locked' | 'coming-soon'

export function biomeStatus(biome: BiomeId, progress: BiomeProgress, catalog: Species[] = SPECIES_CATALOG): BiomeStatus {
  if (biome === progress.current) return 'current'
  if (!hasCatalog(biome, catalog)) return 'coming-soon'
  const unlocked = unlockedBiomes(progress)
  if (unlocked.has(biome)) return 'unlocked'
  const bordersUnlocked = BIOME_NEIGHBOURS[biome].some((n) => unlocked.has(n))
  return bordersUnlocked ? 'unlockable' : 'locked'
}

/** A neighbour of any unlocked Biome can be bought once the balance covers its cost. */
export function canUnlock(biome: BiomeId, progress: BiomeProgress, catalog: Species[] = SPECIES_CATALOG): boolean {
  return biomeStatus(biome, progress, catalog) === 'unlockable' && progress.balance >= NEIGHBOUR_UNLOCK_COST
}

export function canSwitchTo(biome: BiomeId, progress: BiomeProgress, catalog: Species[] = SPECIES_CATALOG): boolean {
  return biomeStatus(biome, progress, catalog) === 'unlocked'
}
