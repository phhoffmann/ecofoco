// Catalog vocabulary shared by the app and the build-time catalog pipeline (scripts/build-species-catalog.ts).
// Kept free of app-only imports (bundled JSON, assets) so Node can type-check the pipeline against it.
import type { Locale } from '../i18n/locale.ts'

// IBGE's six Brazilian biomes. Which of them are playable comes from the catalog, not from this list.
export const BIOME_IDS = ['amazon', 'atlantic-forest', 'caatinga', 'cerrado', 'pantanal', 'pampa'] as const
export type BiomeId = (typeof BIOME_IDS)[number]

export type SpeciesKind = 'plant' | 'animal'
export type Rarity = 'common' | 'rare' | 'epic'
export const RARITIES: Rarity[] = ['common', 'rare', 'epic']

// Body-plan / growth-form archetype: garden sprites are chosen per archetype, not per species.
export type PlantArchetype = 'flowering-tree' | 'broadleaf-tree' | 'emergent-tree' | 'pioneer-tree' | 'palm' | 'shrub'
export type AnimalArchetype =
  | 'primate'
  | 'songbird'
  | 'large-bird'
  | 'small-mammal'
  | 'mid-mammal'
  | 'reptile'
  | 'insect'
export type Archetype = PlantArchetype | AnimalArchetype

export const PLANT_ARCHETYPES: PlantArchetype[] = [
  'flowering-tree',
  'broadleaf-tree',
  'emergent-tree',
  'pioneer-tree',
  'palm',
  'shrub',
]
export const ANIMAL_ARCHETYPES: AnimalArchetype[] = [
  'primate',
  'songbird',
  'large-bird',
  'small-mammal',
  'mid-mammal',
  'reptile',
  'insect',
]

/** Licences a bundled photo may carry; anything else would block future commercial use. */
export type PhotoLicense = 'CC0' | 'CC-BY'

export interface PhotoCredit {
  /** File name in src/assets/species/. */
  file: string
  license: PhotoLicense
  /** Photographer, as credited on iNaturalist. */
  credit: string
  /** The iNaturalist observation the photo comes from. */
  sourceUrl: string
}

/** One species as written to src/catalog/<biome>.json. */
export interface CatalogSpecies {
  id: string
  scientificName: string
  type: SpeciesKind
  rarity: Rarity
  archetype: Archetype
  names: Record<Locale, string>
  descriptions: Record<Locale, string>
  photo: PhotoCredit
  /** Where the entry came from, for re-checking: iNaturalist taxon, GBIF backbone key, research-grade observation count. */
  source: { inatTaxonId: number; gbifTaxonKey: number; observations: number }
}

export interface CatalogFile {
  biome: BiomeId
  species: CatalogSpecies[]
}
