import { describe, expect, it } from 'vitest'
import {
  BIOME_IDS,
  BIOME_NEIGHBOURS,
  NEIGHBOUR_UNLOCK_COST,
  biomeStatus,
  canSwitchTo,
  canUnlock,
  earnedPoints,
  hasCatalog,
  isBiomeId,
  unlockedBiomes,
  type BiomeId,
  type BiomeProgress,
} from './biome'
import { SPECIES_CATALOG } from './species'

// The catalog as if Cerrado and the Amazon had no species yet.
const WITHOUT_CERRADO_AND_AMAZON = SPECIES_CATALOG.map((s) => ({
  ...s,
  biome: s.biome.filter((b) => b !== 'cerrado' && b !== 'amazon'),
}))

const progress = (overrides: Partial<BiomeProgress> = {}): BiomeProgress => ({
  home: 'atlantic-forest',
  current: 'atlantic-forest',
  purchased: [],
  balance: 0,
  ...overrides,
})

describe('BIOME_NEIGHBOURS', () => {
  it('is symmetric and never lists a biome as its own neighbour', () => {
    for (const biome of BIOME_IDS) {
      for (const neighbour of BIOME_NEIGHBOURS[biome]) {
        expect(neighbour).not.toBe(biome)
        expect(BIOME_NEIGHBOURS[neighbour]).toContain(biome)
      }
    }
  })

  it('connects all six biomes', () => {
    const queue: BiomeId[] = ['amazon']
    const reached = new Set(queue)
    for (const biome of queue) {
      for (const n of BIOME_NEIGHBOURS[biome]) {
        if (!reached.has(n)) {
          reached.add(n)
          queue.push(n)
        }
      }
    }
    expect(reached.size).toBe(BIOME_IDS.length)
  })
})

describe('isBiomeId', () => {
  it('accepts known ids and rejects anything else', () => {
    expect(isBiomeId('caatinga')).toBe(true)
    expect(isBiomeId('tundra')).toBe(false)
    expect(isBiomeId(undefined)).toBe(false)
  })
})

describe('hasCatalog', () => {
  it('is true for every Brazilian biome now that each has a catalog', () => {
    expect(BIOME_IDS.filter((b) => hasCatalog(b))).toEqual([...BIOME_IDS])
  })

  it('is false for a biome with no species', () => {
    expect(hasCatalog('cerrado', WITHOUT_CERRADO_AND_AMAZON)).toBe(false)
  })

  it('needs both kinds, since focus rewards draw plants and step draws draw animals', () => {
    const plantsOnly = SPECIES_CATALOG.filter((s) => s.type === 'plant')
    expect(hasCatalog('atlantic-forest', plantsOnly)).toBe(false)
  })
})

describe('earnedPoints', () => {
  it('adds points per completed focus session and per step goal met', () => {
    expect(earnedPoints(0, 0)).toBe(0)
    expect(earnedPoints(3, 2)).toBe(50)
  })
})

describe('unlockedBiomes', () => {
  it('is the home biome plus the purchased ones', () => {
    expect(unlockedBiomes({ home: 'caatinga', purchased: ['atlantic-forest'] })).toEqual(
      new Set(['caatinga', 'atlantic-forest']),
    )
  })
})

describe('biomeStatus', () => {
  it('starts with only the home biome unlocked', () => {
    const p = progress()
    expect(biomeStatus('atlantic-forest', p)).toBe('current')
    expect(biomeStatus('caatinga', p)).toBe('unlockable')
  })

  it('shows biomes without a catalog as coming soon, even when they are neighbours', () => {
    expect(biomeStatus('cerrado', progress(), WITHOUT_CERRADO_AND_AMAZON)).toBe('coming-soon')
    expect(biomeStatus('amazon', progress(), WITHOUT_CERRADO_AND_AMAZON)).toBe('coming-soon')
  })

  it('locks catalog biomes that do not border an unlocked one', () => {
    // Pampa only borders Atlantic Forest
    expect(biomeStatus('pampa', progress({ home: 'caatinga', current: 'caatinga' }))).toBe('locked')
    expect(biomeStatus('pampa', progress())).toBe('unlockable')
    expect(biomeStatus('amazon', progress())).toBe('locked')
  })

  it('reports a purchased biome that is not current as unlocked', () => {
    expect(biomeStatus('caatinga', progress({ purchased: ['caatinga'] }))).toBe('unlocked')
  })
})

describe('canUnlock', () => {
  it('needs enough points', () => {
    expect(canUnlock('caatinga', progress({ balance: NEIGHBOUR_UNLOCK_COST - 1 }))).toBe(false)
    expect(canUnlock('caatinga', progress({ balance: NEIGHBOUR_UNLOCK_COST }))).toBe(true)
  })

  it('refuses biomes that are already unlocked or coming soon', () => {
    const rich = NEIGHBOUR_UNLOCK_COST * 10
    expect(canUnlock('atlantic-forest', progress({ balance: rich }))).toBe(false)
    expect(canUnlock('caatinga', progress({ balance: rich, purchased: ['caatinga'] }))).toBe(false)
    expect(canUnlock('cerrado', progress({ balance: rich }), WITHOUT_CERRADO_AND_AMAZON)).toBe(false)
  })
})

describe('canSwitchTo', () => {
  it('allows only unlocked, non-current biomes', () => {
    expect(canSwitchTo('caatinga', progress())).toBe(false)
    expect(canSwitchTo('caatinga', progress({ purchased: ['caatinga'] }))).toBe(true)
    expect(canSwitchTo('atlantic-forest', progress())).toBe(false)
    expect(canSwitchTo('atlantic-forest', progress({ current: 'caatinga', purchased: ['caatinga'] }))).toBe(true)
  })

  it('never allows a biome without a catalog', () => {
    expect(canSwitchTo('cerrado', progress({ purchased: ['cerrado'] }), WITHOUT_CERRADO_AND_AMAZON)).toBe(false)
  })
})
