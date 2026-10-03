import type { BiomeId } from './biome'
import { SPECIES_CATALOG, rarityIn, type Rarity, type Species, type SpeciesKind } from './species'

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  rare: 30,
  epic: 10,
}

/** Weighted by each species' Rarity in the given Biome, from that Biome's species of that kind. */
export function pickRandomSpecies(kind: SpeciesKind, biome: BiomeId): Species {
  const ofKind = SPECIES_CATALOG.filter((s) => s.type === kind)
  const inBiome = ofKind.filter((s) => s.biome.includes(biome))
  // Only playable Biomes (see hasCatalog) can be current, so this fallback is a safety net, not a rule.
  const pool = inBiome.length > 0 ? inBiome : ofKind
  const weight = (s: Species) => RARITY_WEIGHTS[rarityIn(s, biome)]
  const totalWeight = pool.reduce((sum, s) => sum + weight(s), 0)
  let roll = Math.random() * totalWeight
  for (const species of pool) {
    roll -= weight(species)
    if (roll <= 0) return species
  }
  return pool[pool.length - 1]
}
