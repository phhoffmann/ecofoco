import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Species } from '../domain/species'

const { lightHaptic } = vi.hoisted(() => ({ lightHaptic: vi.fn() }))
vi.mock('../data/haptics', () => ({ lightHaptic }))

import { useCelebrationStore } from './celebrationStore'

const species: Species = {
  id: 'jatoba',
  scientificName: 'Hymenaea courbaril',
  type: 'plant',
  rarityByBiome: { 'atlantic-forest': 'common' },
  biome: ['atlantic-forest'],
  archetype: 'broadleaf-tree',
  image: 'jatoba.jpg',
  names: { en: 'jatoba', 'pt-BR': 'jatoba' },
  descriptions: { en: '', 'pt-BR': '' },
  photo: { license: 'CC0', credit: 'Test', sourceUrl: 'https://www.inaturalist.org/observations/1' },
}

describe('celebrationStore', () => {
  beforeEach(() => {
    lightHaptic.mockClear()
    useCelebrationStore.setState({ species: null, seq: 0 })
  })

  it('celebrate() shows the species and plays a light haptic', () => {
    useCelebrationStore.getState().celebrate(species)

    expect(useCelebrationStore.getState().species).toEqual(species)
    expect(lightHaptic).toHaveBeenCalledOnce()
  })

  it('celebrating the same species again bumps seq so the animation replays', () => {
    useCelebrationStore.getState().celebrate(species)
    useCelebrationStore.getState().celebrate(species)

    expect(useCelebrationStore.getState().seq).toBe(2)
  })

  it('dismiss() clears the celebration', () => {
    useCelebrationStore.getState().celebrate(species)
    useCelebrationStore.getState().dismiss()

    expect(useCelebrationStore.getState().species).toBeNull()
  })
})
