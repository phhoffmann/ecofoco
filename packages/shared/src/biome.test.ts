import { describe, expect, it } from 'vitest'
import {
  BIOME_IDS,
  BIOME_NEIGHBOURS,
  FOCUS_MINUTE_POINTS,
  NEIGHBOUR_UNLOCK_COST,
  STEP_GOAL_POINTS,
  biomeStatus,
  canSwitchTo,
  canUnlock,
  focusSessionPoints,
  isBiomeId,
  unlockedBiomes,
  type BiomeId,
  type BiomeProgress,
  type IsPlayable,
} from './biome'

const allPlayable: IsPlayable = () => true
// As if Cerrado and the Amazon had no species yet.
const withoutCerradoAndAmazon: IsPlayable = (b) => b !== 'cerrado' && b !== 'amazon'

const progress = (overrides: Partial<BiomeProgress> = {}): BiomeProgress => ({
  home: 'atlantic-forest',
  current: 'atlantic-forest',
  purchased: [],
  balance: 0,
  ...overrides,
})

describe('point values', () => {
  it('pays 1 per focused minute and 20 per met step goal, and charges 250 per unlock', () => {
    expect(FOCUS_MINUTE_POINTS).toBe(1)
    expect(STEP_GOAL_POINTS).toBe(20)
    expect(NEIGHBOUR_UNLOCK_COST).toBe(250)
  })
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

describe('focusSessionPoints', () => {
  it('earns a point per planned minute', () => {
    expect(focusSessionPoints(3 * 60)).toBe(3)
    expect(focusSessionPoints(25 * 60)).toBe(25)
    expect(focusSessionPoints(45 * 60)).toBe(45)
  })

  it('earns nothing for a part of a minute', () => {
    expect(focusSessionPoints(0)).toBe(0)
    expect(focusSessionPoints(59)).toBe(0)
    expect(focusSessionPoints(119)).toBe(1)
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
    expect(biomeStatus('atlantic-forest', p, allPlayable)).toBe('current')
    expect(biomeStatus('caatinga', p, allPlayable)).toBe('unlockable')
  })

  it('shows unplayable biomes as coming soon, even when they are neighbours', () => {
    expect(biomeStatus('cerrado', progress(), withoutCerradoAndAmazon)).toBe('coming-soon')
    expect(biomeStatus('amazon', progress(), withoutCerradoAndAmazon)).toBe('coming-soon')
  })

  it('locks playable biomes that do not border an unlocked one', () => {
    // Pampa only borders Atlantic Forest
    expect(biomeStatus('pampa', progress({ home: 'caatinga', current: 'caatinga' }), allPlayable)).toBe('locked')
    expect(biomeStatus('pampa', progress(), allPlayable)).toBe('unlockable')
    expect(biomeStatus('amazon', progress(), allPlayable)).toBe('locked')
  })

  it('reports a purchased biome that is not current as unlocked', () => {
    expect(biomeStatus('caatinga', progress({ purchased: ['caatinga'] }), allPlayable)).toBe('unlocked')
  })
})

describe('canUnlock', () => {
  it('needs enough points', () => {
    expect(canUnlock('caatinga', progress({ balance: NEIGHBOUR_UNLOCK_COST - 1 }), allPlayable)).toBe(false)
    expect(canUnlock('caatinga', progress({ balance: NEIGHBOUR_UNLOCK_COST }), allPlayable)).toBe(true)
  })

  it('refuses biomes that are already unlocked, not neighbours, or coming soon', () => {
    const rich = NEIGHBOUR_UNLOCK_COST * 10
    expect(canUnlock('atlantic-forest', progress({ balance: rich }), allPlayable)).toBe(false)
    expect(canUnlock('caatinga', progress({ balance: rich, purchased: ['caatinga'] }), allPlayable)).toBe(false)
    expect(canUnlock('amazon', progress({ balance: rich }), allPlayable)).toBe(false)
    expect(canUnlock('cerrado', progress({ balance: rich }), withoutCerradoAndAmazon)).toBe(false)
  })
})

describe('canSwitchTo', () => {
  it('allows only unlocked, non-current biomes', () => {
    expect(canSwitchTo('caatinga', progress(), allPlayable)).toBe(false)
    expect(canSwitchTo('caatinga', progress({ purchased: ['caatinga'] }), allPlayable)).toBe(true)
    expect(canSwitchTo('atlantic-forest', progress(), allPlayable)).toBe(false)
    expect(canSwitchTo('atlantic-forest', progress({ current: 'caatinga', purchased: ['caatinga'] }), allPlayable)).toBe(
      true,
    )
  })

  it('never allows an unplayable biome', () => {
    expect(canSwitchTo('cerrado', progress({ purchased: ['cerrado'] }), withoutCerradoAndAmazon)).toBe(false)
  })
})
