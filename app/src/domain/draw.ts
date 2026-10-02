import type { BiomeId } from './biome'
import { SPECIES_CATALOG, type Rarity, type Species, type SpeciesKind } from './species'

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  rare: 30,
  epic: 10,
}

/** Weighted by Rarity, from the given Biome's species of that kind. */
export function pickRandomSpecies(kind: SpeciesKind, biome: BiomeId): Species {
  const ofKind = SPECIES_CATALOG.filter((s) => s.type === kind)
  const inBiome = ofKind.filter((s) => s.biome.includes(biome))
  // Only playable Biomes (see hasCatalog) can be current, so this fallback is a safety net, not a rule.
  const pool = inBiome.length > 0 ? inBiome : ofKind
  const totalWeight = pool.reduce((sum, s) => sum + RARITY_WEIGHTS[s.rarity], 0)
  let roll = Math.random() * totalWeight
  for (const species of pool) {
    roll -= RARITY_WEIGHTS[species.rarity]
    if (roll <= 0) return species
  }
  return pool[pool.length - 1]
}
