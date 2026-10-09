import { describe, expect, it } from 'vitest'
import { describeCatch } from './catch'
import { SPECIES_CATALOG } from './species'
import type { CollectedEntry } from './types'

const quaresmeira = SPECIES_CATALOG.find((s) => s.id === 'quaresmeira')!
const entry = (speciesId: string, id = speciesId): CollectedEntry => ({
  id,
  speciesId,
  collectedAt: '2026-09-10T10:00:00.000Z',
  method: 'focus_session',
})

describe('describeCatch', () => {
  const biome = quaresmeira.biome[0]
  const biomeTotal = SPECIES_CATALOG.filter((s) => s.biome.includes(biome)).length

  it('marks a first catch as new and counts it toward the Biome', () => {
    expect(describeCatch(quaresmeira, [entry('quaresmeira')], biome, 10)).toEqual({
      species: quaresmeira,
      biome,
      isNew: true,
      timesCollected: 1,
      dexCollected: 1,
      dexTotal: biomeTotal,
      points: 10,
    })
  })

  it('counts repeat catches without counting the species twice toward the Biome', () => {
    const entries = [entry('quaresmeira', 'a'), entry('quaresmeira', 'b'), entry('quaresmeira', 'c')]
    expect(describeCatch(quaresmeira, entries, biome, 0)).toMatchObject({ isNew: false, timesCollected: 3, dexCollected: 1 })
  })

  it('only counts species of the given Biome', () => {
    const elsewhere = SPECIES_CATALOG.find((s) => !s.biome.includes(biome))!
    const entries = [entry('quaresmeira'), entry(elsewhere.id)]
    expect(describeCatch(quaresmeira, entries, biome, 0).dexCollected).toBe(1)
  })
})
