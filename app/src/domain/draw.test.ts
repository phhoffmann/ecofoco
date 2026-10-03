import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Species } from './species'

const { FIXTURE_CATALOG } = vi.hoisted(() => {
  const FIXTURE_CATALOG: Species[] = [
    {
      id: 'common-plant',
      scientificName: 'Plantus communis',
      type: 'plant',
      rarityByBiome: { 'atlantic-forest': 'common' },
      biome: ['atlantic-forest'],
      archetype: 'broadleaf-tree',
      image: 'common-plant.jpg',
      names: { en: 'common-plant', 'pt-BR': 'common-plant' },
      descriptions: { en: '', 'pt-BR': '' },
      photo: { license: 'CC0', credit: 'Test', sourceUrl: 'https://www.inaturalist.org/observations/1' },
    },
    {
      id: 'rare-plant',
      scientificName: 'Plantus rarus',
      type: 'plant',
      rarityByBiome: { 'atlantic-forest': 'rare' },
      biome: ['atlantic-forest'],
      archetype: 'broadleaf-tree',
      image: 'rare-plant.jpg',
      names: { en: 'rare-plant', 'pt-BR': 'rare-plant' },
      descriptions: { en: '', 'pt-BR': '' },
      photo: { license: 'CC0', credit: 'Test', sourceUrl: 'https://www.inaturalist.org/observations/1' },
    },
    {
      id: 'epic-plant',
      scientificName: 'Plantus epicus',
      type: 'plant',
      rarityByBiome: { 'atlantic-forest': 'epic' },
      biome: ['atlantic-forest'],
      archetype: 'broadleaf-tree',
      image: 'epic-plant.jpg',
      names: { en: 'epic-plant', 'pt-BR': 'epic-plant' },
      descriptions: { en: '', 'pt-BR': '' },
      photo: { license: 'CC0', credit: 'Test', sourceUrl: 'https://www.inaturalist.org/observations/1' },
    },
    {
      id: 'common-animal',
      scientificName: 'Animalus communis',
      type: 'animal',
      rarityByBiome: { 'atlantic-forest': 'common' },
      biome: ['atlantic-forest'],
      archetype: 'small-mammal',
      image: 'common-animal.jpg',
      names: { en: 'common-animal', 'pt-BR': 'common-animal' },
      descriptions: { en: '', 'pt-BR': '' },
      photo: { license: 'CC0', credit: 'Test', sourceUrl: 'https://www.inaturalist.org/observations/1' },
    },
    {
      id: 'caatinga-animal',
      scientificName: 'Animalus siccus',
      type: 'animal',
      rarityByBiome: { caatinga: 'epic', cerrado: 'common' },
      biome: ['caatinga', 'cerrado'],
      archetype: 'reptile',
      image: 'caatinga-animal.jpg',
      names: { en: 'caatinga-animal', 'pt-BR': 'caatinga-animal' },
      descriptions: { en: '', 'pt-BR': '' },
      photo: { license: 'CC0', credit: 'Test', sourceUrl: 'https://www.inaturalist.org/observations/1' },
    },
    {
      id: 'cerrado-animal',
      scientificName: 'Animalus campestris',
      type: 'animal',
      rarityByBiome: { cerrado: 'epic' },
      biome: ['cerrado'],
      archetype: 'songbird',
      image: 'cerrado-animal.jpg',
      names: { en: 'cerrado-animal', 'pt-BR': 'cerrado-animal' },
      descriptions: { en: '', 'pt-BR': '' },
      photo: { license: 'CC0', credit: 'Test', sourceUrl: 'https://www.inaturalist.org/observations/1' },
    },
  ]
  return { FIXTURE_CATALOG }
})

vi.mock('./species', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./species')>()),
  SPECIES_CATALOG: FIXTURE_CATALOG,
}))

import { pickRandomSpecies } from './draw'

describe('pickRandomSpecies', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('only returns species matching the requested kind', () => {
    for (let i = 0; i < 25; i++) {
      expect(pickRandomSpecies('plant', 'atlantic-forest').type).toBe('plant')
    }
  })

  it('only returns species from the requested biome', () => {
    // each biome has a single animal in the fixture, so this pins the pool
    expect(pickRandomSpecies('animal', 'atlantic-forest').id).toBe('common-animal')
    expect(pickRandomSpecies('animal', 'caatinga').id).toBe('caatinga-animal')
  })

  it('falls back to every species of the kind when the biome has none', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(pickRandomSpecies('plant', 'pampa').id).toBe('common-plant')
  })

  it('resolves the weighted roll to the expected rarity bucket', () => {
    // plant pool weights: common=60, rare=30, epic=10 -> total 100
    // cumulative bucket edges: [0,60) common, [60,90) rare, [90,100) epic
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(pickRandomSpecies('plant', 'atlantic-forest').id).toBe('common-plant')

    vi.spyOn(Math, 'random').mockReturnValue(0.65)
    expect(pickRandomSpecies('plant', 'atlantic-forest').id).toBe('rare-plant')

    vi.spyOn(Math, 'random').mockReturnValue(0.95)
    expect(pickRandomSpecies('plant', 'atlantic-forest').id).toBe('epic-plant')
  })

  it('weights a shared species by its Rarity in the requested biome', () => {
    // cerrado animal weights: caatinga-animal common=60, cerrado-animal epic=10 -> total 70
    vi.spyOn(Math, 'random').mockReturnValue(0.8)
    expect(pickRandomSpecies('animal', 'cerrado').id).toBe('caatinga-animal')
  })
})
