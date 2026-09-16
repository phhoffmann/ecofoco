import { SPECIES_CATALOG, type Rarity, type Species, type SpeciesKind } from './species'

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  rare: 30,
  epic: 10,
}

export function pickRandomSpecies(kind: SpeciesKind): Species {
  const pool = SPECIES_CATALOG.filter((s) => s.type === kind)
  const totalWeight = pool.reduce((sum, s) => sum + RARITY_WEIGHTS[s.rarity], 0)
  let roll = Math.random() * totalWeight
  for (const species of pool) {
    roll -= RARITY_WEIGHTS[species.rarity]
    if (roll <= 0) return species
  }
  return pool[pool.length - 1]
}
