import { describe, expect, it } from 'vitest'
import { en } from '../i18n/locales/en'
import { ptBR } from '../i18n/locales/pt-BR'
import { PLANT_ARCHETYPES, SPECIES_CATALOG, collectedCatalogSpeciesIds, type Archetype } from './species'
import type { CollectedEntry } from './types'

function entry(speciesId: string): CollectedEntry {
  return { id: `entry-${speciesId}`, speciesId, collectedAt: '2026-10-01T12:00:00.000Z', method: 'draw' }
}

describe('collectedCatalogSpeciesIds', () => {
  it('ignores entries whose species is no longer in the catalog', () => {
    const known = SPECIES_CATALOG[0].id
    const ids = collectedCatalogSpeciesIds([entry(known), entry('jacaranda-mimoso')])
    expect([...ids]).toEqual([known])
  })

  it('counts each catalog species once', () => {
    const known = SPECIES_CATALOG[0].id
    expect(collectedCatalogSpeciesIds([entry(known), entry(known)]).size).toBe(1)
  })
})

const isPlantArchetype = (archetype: Archetype) => (PLANT_ARCHETYPES as Archetype[]).includes(archetype)

describe('SPECIES_CATALOG archetypes', () => {
  it.each(SPECIES_CATALOG)('$id has an archetype matching its type', (species) => {
    expect(isPlantArchetype(species.archetype)).toBe(species.type === 'plant')
  })
})

describe('SPECIES_CATALOG content', () => {
  it('has unique ids', () => {
    expect(new Set(SPECIES_CATALOG.map((s) => s.id)).size).toBe(SPECIES_CATALOG.length)
  })

  it.each(SPECIES_CATALOG)('$id has a name and description in every locale', (species) => {
    for (const locale of [en, ptBR]) {
      const text = (locale.species as Record<string, { name: string; description: string } | undefined>)[species.id]
      expect(text?.name).toBeTruthy()
      expect(text?.description).toBeTruthy()
    }
  })

  it.each(SPECIES_CATALOG)('$id credits the photographer of a CC-BY image', (species) => {
    if (species.imageLicense === 'CC-BY') expect(species.imageAttribution).toBeTruthy()
  })
})
