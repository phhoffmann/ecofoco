import type { AnimalArchetype, Archetype, PlantArchetype } from '../../src/domain/catalogSchema.ts'
import type { IconicTaxon } from './config.ts'

/** The ranks archetype rules look at, from GBIF's backbone match. */
export interface Taxonomy {
  iconicTaxon: IconicTaxon
  order?: string
  family?: string
  genus?: string
}

// Most specific rule wins: genus, then family, then order, then the iconic taxon's default.
const PLANT_GENERA: Record<string, PlantArchetype> = {
  Cecropia: 'pioneer-tree',
  Schizolobium: 'pioneer-tree',
  Trema: 'pioneer-tree',
  Erythrina: 'flowering-tree',
  Pleroma: 'flowering-tree',
  Tibouchina: 'flowering-tree',
  Cassia: 'flowering-tree',
  Senna: 'shrub',
  // Herbs, shrubs and vines in tree-dominated families
  Mimosa: 'shrub',
  Periandra: 'shrub',
  Manihot: 'shrub',
  Pyrostegia: 'shrub',
  Calliandra: 'shrub',
  Duguetia: 'shrub',
  Theobroma: 'broadleaf-tree',
  Ceiba: 'emergent-tree',
  Bertholletia: 'emergent-tree',
  Cariniana: 'emergent-tree',
  Araucaria: 'emergent-tree',
  Ficus: 'broadleaf-tree',
  Bauhinia: 'flowering-tree',
}

const PLANT_FAMILIES: Record<string, PlantArchetype> = {
  Arecaceae: 'palm',
  Bignoniaceae: 'flowering-tree',
  Vochysiaceae: 'flowering-tree',
  Lecythidaceae: 'emergent-tree',
  Araucariaceae: 'emergent-tree',
  Urticaceae: 'pioneer-tree',
  Cannabaceae: 'pioneer-tree',
  Euphorbiaceae: 'pioneer-tree',
  Fabaceae: 'broadleaf-tree',
  Lauraceae: 'broadleaf-tree',
  Myrtaceae: 'broadleaf-tree',
  Moraceae: 'broadleaf-tree',
  Anacardiaceae: 'broadleaf-tree',
  Annonaceae: 'broadleaf-tree',
  Sapindaceae: 'broadleaf-tree',
  Meliaceae: 'broadleaf-tree',
  Caryocaraceae: 'broadleaf-tree',
  Chrysobalanaceae: 'broadleaf-tree',
  Sapotaceae: 'broadleaf-tree',
  Combretaceae: 'broadleaf-tree',
  Rhizophoraceae: 'broadleaf-tree',
  Dilleniaceae: 'broadleaf-tree',
  Acanthaceae: 'shrub',
}

const BIRD_GENERA: Record<string, AnimalArchetype> = {
  Ara: 'large-bird',
  Anodorhynchus: 'large-bird',
  Cyanopsitta: 'large-bird',
  Amazona: 'large-bird',
}

const BIRD_FAMILIES: Record<string, AnimalArchetype> = {
  Ramphastidae: 'large-bird',
  Cracidae: 'large-bird',
}

// Orders of birds too big for the songbird sprite.
const LARGE_BIRD_ORDERS = new Set([
  'Accipitriformes',
  'Falconiformes',
  'Cathartiformes',
  'Strigiformes',
  'Pelecaniformes',
  'Ciconiiformes',
  'Suliformes',
  'Galliformes',
  'Anseriformes',
  'Rheiformes',
  'Cariamiformes',
  'Tinamiformes',
  'Gruiformes',
  'Opisthocomiformes',
])

const MAMMAL_GENERA: Record<string, AnimalArchetype> = {
  Hydrochoerus: 'mid-mammal',
  Dasyprocta: 'mid-mammal',
  Cuniculus: 'mid-mammal',
  Coendou: 'mid-mammal',
}

const SMALL_MAMMAL_ORDERS = new Set(['Rodentia', 'Didelphimorphia', 'Chiroptera', 'Lagomorpha'])

function plantArchetype(t: Taxonomy): PlantArchetype {
  return (t.genus && PLANT_GENERA[t.genus]) || (t.family && PLANT_FAMILIES[t.family]) || 'shrub'
}

function birdArchetype(t: Taxonomy): AnimalArchetype {
  if (t.genus && BIRD_GENERA[t.genus]) return BIRD_GENERA[t.genus]
  if (t.family && BIRD_FAMILIES[t.family]) return BIRD_FAMILIES[t.family]
  return t.order && LARGE_BIRD_ORDERS.has(t.order) ? 'large-bird' : 'songbird'
}

function mammalArchetype(t: Taxonomy): AnimalArchetype {
  if (t.genus && MAMMAL_GENERA[t.genus]) return MAMMAL_GENERA[t.genus]
  if (t.order === 'Primates') return 'primate'
  return t.order && SMALL_MAMMAL_ORDERS.has(t.order) ? 'small-mammal' : 'mid-mammal'
}

/** Garden archetype from taxonomy; species-text.ts can override it per species. */
export function archetypeFor(t: Taxonomy): Archetype {
  switch (t.iconicTaxon) {
    case 'Plantae':
      return plantArchetype(t)
    case 'Aves':
      return birdArchetype(t)
    case 'Mammalia':
      return mammalArchetype(t)
    case 'Reptilia':
      return 'reptile'
    case 'Insecta':
      return 'insect'
  }
}

// Marine groups wash up in coastal states' counts but are not part of a land Biome's garden.
const MARINE_ORDERS = new Set(['Cetacea', 'Sphenisciformes', 'Procellariiformes'])
const MARINE_FAMILIES = new Set([
  'Otariidae',
  'Phocidae',
  'Cheloniidae',
  'Dermochelyidae',
  'Fregatidae',
  'Sulidae',
  'Stercorariidae',
  'Laridae',
  'Sternidae',
])

export function isMarine(t: Taxonomy): boolean {
  return (!!t.order && MARINE_ORDERS.has(t.order)) || (!!t.family && MARINE_FAMILIES.has(t.family))
}
