import type { BiomeId } from '../../src/domain/catalogSchema.ts'

/**
 * iNaturalist standard places (Brazilian states) searched for each Biome's candidates.
 *
 * iNaturalist's establishment filters only work on standard places, so each Biome takes the states that lie
 * mostly inside it. Mixed states bring in neighbouring species; the GBIF cross-check against the Biome's RESOLVE
 * ecoregions (see presence.ts) is what keeps a species in a Biome.
 */
export const BIOME_PLACES: Record<BiomeId, Record<string, number>> = {
  amazon: { Acre: 9316, Amapá: 13328, Amazonas: 10033, Pará: 13332, Rondônia: 12596, Roraima: 12597 },
  'atlantic-forest': {
    'Rio de Janeiro': 13333,
    'Espírito Santo': 13330,
    'São Paulo': 13334,
    Paraná: 12594,
    'Santa Catarina': 7994,
  },
  caatinga: {
    Ceará: 13329,
    'Rio Grande do Norte': 8116,
    Paraíba: 12593,
    Pernambuco: 7293,
    Piauí: 12595,
    Bahia: 7988,
  },
  cerrado: { Goiás: 12592, 'Distrito Federal': 12591, Tocantins: 9181, 'Minas Gerais': 7302 },
  pantanal: { 'Mato Grosso do Sul': 7555, 'Mato Grosso': 8239 },
  pampa: { 'Rio Grande do Sul': 9470 },
}

export type IconicTaxon = 'Plantae' | 'Aves' | 'Mammalia' | 'Reptilia' | 'Insecta'

/**
 * Slots per Biome. Animals get a per-group quota so the most-photographed group (birds) does not take
 * every slot; a group short of passing candidates hands its slots to the best remaining animals.
 * Amphibians and fish have no garden archetype yet, so they are not searched.
 */
export const PLANT_SLOTS = 20
export const ANIMAL_QUOTAS: Record<Exclude<IconicTaxon, 'Plantae'>, number> = {
  Aves: 8,
  Mammalia: 5,
  Reptilia: 3,
  Insecta: 4,
}

// Share of each Biome's plants (and animals) per Rarity, ranked by observation count; matches the Draw weights.
export const RARITY_SHARES = { common: 0.6, rare: 0.3, epic: 0.1 } as const

// A species counts as present in a Biome when at least this many of its sampled GBIF occurrences fall in the Biome's ecoregions.
export const MIN_BIOME_OCCURRENCES = 3
// GBIF occurrences sampled per species and Biome (the API's page maximum).
export const GBIF_SAMPLE_SIZE = 300

// Candidates fetched per iconic taxon and Biome (the species_counts page maximum).
export const CANDIDATES_PER_TAXON = 500

// iNaturalist asks for at most ~60 requests a minute; GBIF has no fixed limit but asks for restraint.
export const INAT_MIN_INTERVAL_MS = 1100
export const GBIF_MIN_INTERVAL_MS = 250
export const PHOTO_MIN_INTERVAL_MS = 500

// Bundled photo: iNaturalist "medium" (500 px long edge) re-encoded as WebP, lowering the quality step by
// step until it fits the byte budget.
export const PHOTO_WEBP_QUALITIES = [72, 64, 56, 48, 40]
export const PHOTO_MAX_BYTES = 45_000
export const PHOTO_MAX_EDGE = 480
// Observation photos whose original's long edge is smaller than this are picked only when nothing larger qualifies.
export const MIN_PHOTO_EDGE = 1000

// Mainland Brazil plus a margin; GBIF samples are taken inside each Biome's ecoregion cells within it.
export const BRAZIL_BOUNDS = { minLat: -34, maxLat: 5.5, minLng: -74.5, maxLng: -34.5 }
