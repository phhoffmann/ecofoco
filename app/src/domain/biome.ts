import {
  biomeStatus as sharedBiomeStatus,
  canSwitchTo as sharedCanSwitchTo,
  canUnlock as sharedCanUnlock,
  type BiomeId,
  type BiomeProgress,
  type BiomeStatus,
} from '@ecofoco/shared'
import { SPECIES_CATALOG, type Species } from './species'

export {
  BIOME_IDS,
  BIOME_NEIGHBOURS,
  FOCUS_MINUTE_POINTS,
  NEIGHBOUR_UNLOCK_COST,
  STEP_GOAL_POINTS,
  focusSessionPoints,
  isBiomeId,
  unlockedBiomes,
  type BiomeId,
  type BiomeProgress,
  type BiomeStatus,
  type HomeBiomeSource,
} from '@ecofoco/shared'

// The original catalog's Biome, used only if a reward is drawn before onboarding picked a home.
export const FALLBACK_BIOME: BiomeId = 'atlantic-forest'

/** A Biome is playable once the catalog has plants and animals for it; the rest show as "coming soon". */
export function hasCatalog(biome: BiomeId, catalog: Species[] = SPECIES_CATALOG): boolean {
  const inBiome = catalog.filter((s) => s.biome.includes(biome))
  return inBiome.some((s) => s.type === 'plant') && inBiome.some((s) => s.type === 'animal')
}

// The unlock rules live in @ecofoco/shared; the app supplies which Biomes its bundled catalog makes playable.
const playableIn = (catalog: Species[]) => (biome: BiomeId) => hasCatalog(biome, catalog)

export function biomeStatus(biome: BiomeId, progress: BiomeProgress, catalog: Species[] = SPECIES_CATALOG): BiomeStatus {
  return sharedBiomeStatus(biome, progress, playableIn(catalog))
}

export function canUnlock(biome: BiomeId, progress: BiomeProgress, catalog: Species[] = SPECIES_CATALOG): boolean {
  return sharedCanUnlock(biome, progress, playableIn(catalog))
}

export function canSwitchTo(biome: BiomeId, progress: BiomeProgress, catalog: Species[] = SPECIES_CATALOG): boolean {
  return sharedCanSwitchTo(biome, progress, playableIn(catalog))
}
