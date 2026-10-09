import type { BiomeId } from './biome'
import { SPECIES_CATALOG, collectedBySpecies, speciesOfBiome, type Species } from './species'
import type { CollectedEntry } from './types'

/** What one new CollectedEntry means for the user, shown once when it is collected. */
export interface CatchReveal {
  species: Species
  biome: BiomeId
  /** First time this Species was collected. */
  isNew: boolean
  /** How many times the Species has been collected, this catch included. */
  timesCollected: number
  /** Species of the Biome collected so far, and how many it has. */
  dexCollected: number
  dexTotal: number
  /** Points this catch earned; 0 when it earned none. */
  points: number
}

/** `entries` must already include the new entry. */
export function describeCatch(
  species: Species,
  entries: CollectedEntry[],
  biome: BiomeId,
  points: number,
  catalog: Species[] = SPECIES_CATALOG,
): CatchReveal {
  const collected = collectedBySpecies(entries)
  const timesCollected = Math.max(1, collected.get(species.id)?.count ?? 0)
  const biomeSpecies = speciesOfBiome(biome, catalog)
  return {
    species,
    biome,
    isNew: timesCollected === 1,
    timesCollected,
    dexCollected: biomeSpecies.filter((s) => collected.has(s.id)).length,
    dexTotal: biomeSpecies.length,
    points,
  }
}
