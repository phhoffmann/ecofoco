import { describe, expect, it } from 'vitest'
import { SUPPORTED_LOCALES } from '../i18n/locale'
import { ANIMAL_ARCHETYPES, BIOME_IDS, PLANT_ARCHETYPES, RARITIES, type CatalogSpecies } from './catalogSchema'
import {
  CATALOG_FILES,
  SPECIES_CATALOG,
  buildCatalog,
  collectedCatalogSpeciesIds,
  speciesDescription,
  speciesName,
} from './species'
import type { CollectedEntry } from './types'

function entry(speciesId: string): CollectedEntry {
  return { id: `entry-${speciesId}`, speciesId, collectedAt: '2026-10-01T12:00:00.000Z', method: 'draw' }
}

// Ids of the first Atlantic Forest and Caatinga catalogs: collected entries point at them.
const LEGACY_IDS = [
  'ipe-amarelo', 'quaresmeira', 'pau-brasil', 'jequitiba-rosa', 'palmito-jucara', 'canela-guaica', 'ipe-roxo',
  'embauba', 'guapuruvu', 'aroeira-pimenteira', 'sagui-de-tufo-preto', 'bem-te-vi', 'gamba-de-orelha-preta', 'jacu',
  'tucano-de-bico-verde', 'quati', 'lagarto-teiu', 'sabia-laranjeira', 'borboleta-azul', 'prea', 'mandacaru',
  'xique-xique', 'jurema-preta', 'catingueira', 'facheiro', 'coroa-de-frade', 'faveleira', 'craibeira', 'mulungu',
  'barriguda', 'asa-branca', 'carcara', 'galo-de-campina', 'sagui-de-tufo-branco', 'calango', 'moco',
  'cachorro-do-mato', 'periquito-da-caatinga', 'arara-azul-de-lear', 'tatu-bola',
]
// Dropped by the iNaturalist/GBIF catalog because iNaturalist does not list them as native in their biome's states.
const REMOVED_IDS = ['ipe-amarelo', 'jacu']

describe('collectedCatalogSpeciesIds', () => {
  it('ignores entries whose species is no longer in the catalog', () => {
    const known = SPECIES_CATALOG[0].id
    const ids = collectedCatalogSpeciesIds([entry(known), entry('jacaranda-mimoso'), ...REMOVED_IDS.map(entry)])
    expect([...ids]).toEqual([known])
  })

  it('counts each catalog species once', () => {
    const known = SPECIES_CATALOG[0].id
    expect(collectedCatalogSpeciesIds([entry(known), entry(known)]).size).toBe(1)
  })
})

describe('legacy species ids', () => {
  const ids = new Set(SPECIES_CATALOG.map((s) => s.id))

  it.each(LEGACY_IDS.filter((id) => !REMOVED_IDS.includes(id)))('keeps %s', (id) => {
    expect(ids.has(id)).toBe(true)
  })

  it.each(REMOVED_IDS)('no longer has %s', (id) => {
    expect(ids.has(id)).toBe(false)
  })
})

describe('catalog files', () => {
  it('has one file per Biome', () => {
    expect(CATALOG_FILES.map((f) => f.biome).sort()).toEqual([...BIOME_IDS].sort())
  })

  it.each(CATALOG_FILES)('$biome has 20 plants and 20 animals with unique ids', ({ species }) => {
    expect(species.filter((s) => s.type === 'plant')).toHaveLength(20)
    expect(species.filter((s) => s.type === 'animal')).toHaveLength(20)
    expect(new Set(species.map((s) => s.id)).size).toBe(species.length)
  })

  it('describes a species shared by several Biomes identically in each file', () => {
    const seen = new Map<string, string>()
    for (const { species } of CATALOG_FILES) {
      for (const { source: _source, ...s } of species) {
        const json = JSON.stringify(s)
        expect(seen.get(s.id) ?? json).toBe(json)
        seen.set(s.id, json)
      }
    }
  })
})

const ALL_SPECIES: CatalogSpecies[] = CATALOG_FILES.flatMap((f) => f.species)
// Keys only: the files themselves are not loaded.
const BUNDLED_PHOTOS = new Set(Object.keys(import.meta.glob('../assets/species/*.webp')))
const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean).length

describe.each(ALL_SPECIES)('$id', (species) => {
  it('has a slug id, a binomial scientific name, and a valid kind, rarity and archetype', () => {
    expect(species.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    expect(species.scientificName).toMatch(/^[A-Z][a-z]+ [a-z-]+$/)
    expect(RARITIES).toContain(species.rarity)
    const archetypes: string[] = species.type === 'plant' ? PLANT_ARCHETYPES : ANIMAL_ARCHETYPES
    expect(archetypes).toContain(species.archetype)
  })

  it('has a name and a short description in every locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(species.names[locale]?.trim()).toBeTruthy()
      const description = species.descriptions[locale]
      expect(description?.trim()).toBeTruthy()
      expect(sentences(description)).toBeLessThanOrEqual(2)
      expect(description.length).toBeLessThanOrEqual(200)
    }
  })

  it('has a bundled CC0/CC-BY photo with its credit', () => {
    expect(['CC0', 'CC-BY']).toContain(species.photo.license)
    expect(species.photo.credit.trim()).toBeTruthy()
    expect(species.photo.sourceUrl).toMatch(/^https:\/\/www\.inaturalist\.org\/observations\/\d+$/)
    expect(species.photo.file).toBe(`${species.id}.webp`)
    expect(BUNDLED_PHOTOS.has(`../assets/species/${species.photo.file}`)).toBe(true)
  })
})

describe('buildCatalog', () => {
  const species = (id: string): CatalogSpecies => ({
    id,
    scientificName: 'Genus species',
    type: 'animal',
    rarity: 'common',
    archetype: 'songbird',
    names: { en: `${id} en`, 'pt-BR': `${id} pt` },
    descriptions: { en: 'A bird.', 'pt-BR': 'Uma ave.' },
    photo: { file: `${id}.webp`, license: 'CC-BY', credit: 'Ana', sourceUrl: 'https://www.inaturalist.org/observations/1' },
    source: { inatTaxonId: 1, gbifTaxonKey: 1, observations: 10 },
  })

  it('merges a species found in several files into one entry tagged with every Biome', () => {
    const catalog = buildCatalog(
      [
        { biome: 'pampa', species: [species('quero-quero')] },
        { biome: 'atlantic-forest', species: [species('quero-quero'), species('bem-te-vi')] },
      ],
      { '../assets/species/quero-quero.webp': '/assets/quero-quero.webp' },
    )
    expect(catalog.map((s) => [s.id, s.biome])).toEqual([
      ['quero-quero', ['atlantic-forest', 'pampa']],
      ['bem-te-vi', ['atlantic-forest']],
    ])
    expect(catalog[0]).toMatchObject({
      image: '/assets/quero-quero.webp',
      photo: { license: 'CC-BY', credit: 'Ana', sourceUrl: 'https://www.inaturalist.org/observations/1' },
    })
  })

  it('resolves names and descriptions for the current language', () => {
    const [s] = buildCatalog([{ biome: 'pampa', species: [species('cardeal')] }], {})
    expect(speciesName(s, 'pt-BR')).toBe('cardeal pt')
    expect(speciesName(s, 'en')).toBe('cardeal en')
    expect(speciesName(s, 'fr')).toBe('cardeal en')
    expect(speciesDescription(s, 'pt-BR')).toBe('Uma ave.')
  })
})

describe('SPECIES_CATALOG', () => {
  it('resolves every bundled photo', () => {
    for (const s of SPECIES_CATALOG) expect(s.image).toBeTruthy()
  })
})
