import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Species } from './species'

const { FIXTURE_CATALOG } = vi.hoisted(() => {
  const FIXTURE_CATALOG: Species[] = [
    {
      id: 'common-plant',
      scientificName: 'Plantus communis',
      type: 'plant',
      rarity: 'common',
      biome: ['atlantic-forest'],
      image: 'common-plant.jpg',
      imageLicense: 'CC0',
    },
    {
      id: 'rare-plant',
      scientificName: 'Plantus rarus',
      type: 'plant',
      rarity: 'rare',
      biome: ['atlantic-forest'],
      image: 'rare-plant.jpg',
      imageLicense: 'CC0',
    },
    {
      id: 'epic-plant',
      scientificName: 'Plantus epicus',
      type: 'plant',
      rarity: 'epic',
      biome: ['atlantic-forest'],
      image: 'epic-plant.jpg',
      imageLicense: 'CC0',
    },
    {
      id: 'common-animal',
      scientificName: 'Animalus communis',
      type: 'animal',
      rarity: 'common',
      biome: ['atlantic-forest'],
      image: 'common-animal.jpg',
      imageLicense: 'CC0',
    },
  ]
  return { FIXTURE_CATALOG }
})

vi.mock('./species', () => ({ SPECIES_CATALOG: FIXTURE_CATALOG }))

import { pickRandomSpecies } from './draw'

describe('pickRandomSpecies', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('only returns species matching the requested kind', () => {
    for (let i = 0; i < 25; i++) {
      expect(pickRandomSpecies('plant').type).toBe('plant')
    }
    // the fixture only has one animal, so this also pins its id
    expect(pickRandomSpecies('animal').id).toBe('common-animal')
  })

  it('resolves the weighted roll to the expected rarity bucket', () => {
    // plant pool weights: common=60, rare=30, epic=10 -> total 100
    // cumulative bucket edges: [0,60) common, [60,90) rare, [90,100) epic
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(pickRandomSpecies('plant').id).toBe('common-plant')

    vi.spyOn(Math, 'random').mockReturnValue(0.65)
    expect(pickRandomSpecies('plant').id).toBe('rare-plant')

    vi.spyOn(Math, 'random').mockReturnValue(0.95)
    expect(pickRandomSpecies('plant').id).toBe('epic-plant')
  })
})
