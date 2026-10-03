import { describe, expect, it, vi } from 'vitest'
import {
  byObservations,
  choosePhoto,
  creditFromAttribution,
  fillQuotas,
  inatLicense,
  isAllowedGbifLicense,
  mostCommon,
  pickName,
  rarityByRank,
  slugify,
  speciesCountsQuery,
  type Candidate,
  type Observation,
  type ObservationPhoto,
} from './select.ts'

describe('licence filter', () => {
  it.each([
    ['cc0', 'CC0'],
    ['CC-BY', 'CC-BY'],
    ['cc-by-nc', null],
    ['cc-by-sa', null],
    ['cc-by-nd', null],
    [null, null],
  ])('iNaturalist %s → %s', (code, expected) => {
    expect(inatLicense(code)).toBe(expected)
  })

  it.each([
    ['http://creativecommons.org/publicdomain/zero/1.0/legalcode', true],
    ['http://creativecommons.org/licenses/by/4.0/legalcode', true],
    ['http://creativecommons.org/licenses/by-nc/4.0/legalcode', false],
    [undefined, false],
  ])('GBIF %s → %s', (url, expected) => {
    expect(isAllowedGbifLicense(url)).toBe(expected)
  })
})

describe('speciesCountsQuery', () => {
  const query = speciesCountsQuery([13334, 7994])

  it('asks for research-grade observations with CC0/CC-BY photos in the given places', () => {
    expect(query).toMatchObject({ place_id: '13334,7994', quality_grade: 'research', photo_license: 'cc0,cc-by' })
  })

  it('excludes only species recorded as introduced, keeping those with no establishment record', () => {
    expect(query.introduced).toBe('false')
    expect(query).not.toHaveProperty('native')
  })
})

describe('ranking', () => {
  it('orders by observation count, then by scientific name', () => {
    const ranked = [
      { scientificName: 'B b', count: 5 },
      { scientificName: 'A a', count: 5 },
      { scientificName: 'C c', count: 9 },
    ].sort(byObservations)
    expect(ranked.map((s) => s.scientificName)).toEqual(['C c', 'A a', 'B b'])
  })
})

describe('rarityByRank', () => {
  const species = (n: number) => Array.from({ length: n }, (_, i) => ({ scientificName: `S ${i}`, count: 100 - i }))

  it('splits 20 species 12 common / 6 rare / 2 epic, most observed first', () => {
    const tiers = rarityByRank(species(20))
    const counts = { common: 0, rare: 0, epic: 0 }
    for (const tier of tiers.values()) counts[tier]++
    expect(counts).toEqual({ common: 12, rare: 6, epic: 2 })
    expect(tiers.get('S 0')).toBe('common')
    expect(tiers.get('S 19')).toBe('epic')
  })

  it('does not depend on input order', () => {
    const shuffled = species(10).reverse()
    expect(rarityByRank(shuffled)).toEqual(rarityByRank(species(10)))
  })

  it('keeps the most common tier of a species ranked in several Biomes', () => {
    expect(mostCommon(['epic', 'rare'])).toBe('rare')
    expect(mostCommon(['epic', 'common', 'rare'])).toBe('common')
  })
})

describe('fillQuotas', () => {
  const c = (scientificName: string, group: string, count: number): Candidate => ({ scientificName, group, count })

  it('fills each group with its most observed accepted candidates', async () => {
    const candidates = [c('Bird 1', 'Aves', 50), c('Bird 2', 'Aves', 40), c('Bird 3', 'Aves', 30), c('Snake', 'Reptilia', 5)]
    const { chosen } = await fillQuotas([], candidates, { Aves: 2, Reptilia: 1 }, async (x) => x.scientificName !== 'Bird 1')
    expect(chosen.map((x) => x.scientificName)).toEqual(['Bird 2', 'Bird 3', 'Snake'])
  })

  it('puts pinned species first and drops the ones that no longer pass', async () => {
    const pinned = [c('Old bird', 'Aves', 1), c('Gone bird', 'Aves', 1)]
    const candidates = [c('Bird 1', 'Aves', 50), c('Bird 2', 'Aves', 40)]
    const { chosen, droppedPins } = await fillQuotas(pinned, candidates, { Aves: 2 }, async (x) => x.scientificName !== 'Gone bird')
    expect(chosen.map((x) => x.scientificName)).toEqual(['Old bird', 'Bird 1'])
    expect(droppedPins.map((x) => x.scientificName)).toEqual(['Gone bird'])
  })

  it('hands a short group’s slots to the best remaining candidates', async () => {
    const candidates = [c('Bird 1', 'Aves', 50), c('Bird 2', 'Aves', 40), c('Bird 3', 'Aves', 30)]
    const { chosen } = await fillQuotas([], candidates, { Aves: 1, Mammalia: 1 }, async () => true)
    expect(chosen.map((x) => x.scientificName)).toEqual(['Bird 1', 'Bird 2'])
  })

  it('asks about each species once', async () => {
    const accept = vi.fn(async () => false)
    await fillQuotas([], [c('Bird 1', 'Aves', 50)], { Aves: 1, Mammalia: 1 }, accept)
    expect(accept).toHaveBeenCalledTimes(1)
  })
})

describe('names', () => {
  it('prefers the override, then iNaturalist, then GBIF, then the scientific name', () => {
    const pt = { locale: 'pt-BR', scientificName: 'Handroanthus albus' } as const
    expect(pickName({ ...pt, override: 'Ipê', inat: 'ipê-amarelo', gbif: 'Ipê-tabaco' })).toBe('Ipê')
    expect(pickName({ ...pt, inat: 'ipê-amarelo', gbif: 'Ipê-tabaco' })).toBe('Ipê-amarelo')
    expect(pickName({ ...pt, inat: null, gbif: 'ipê-tabaco' })).toBe('Ipê-tabaco')
    expect(pickName({ ...pt, inat: ' ' })).toBe('Handroanthus albus')
  })

  it('title-cases English names from iNaturalist and GBIF, but not overrides or scientific names', () => {
    const en = { locale: 'en', scientificName: 'Solanum americanum' } as const
    expect(pickName({ ...en, inat: 'American black nightshade' })).toBe('American Black Nightshade')
    expect(pickName({ ...en, inat: 'ginger-leaf morning-glory' })).toBe('Ginger-leaf Morning-glory')
    expect(pickName({ ...en, override: 'Needle Turk\'s cap' })).toBe('Needle Turk\'s cap')
    expect(pickName(en)).toBe('Solanum americanum')
    expect(pickName({ locale: 'pt-BR', scientificName: 'x', inat: 'maria-pretinha preta' })).toBe('Maria-pretinha preta')
  })

  it('slugifies Portuguese names into ids', () => {
    expect(slugify('Sabiá-laranjeira')).toBe('sabia-laranjeira')
    expect(slugify('Ipê do Cerrado (amarelo)')).toBe('ipe-do-cerrado-amarelo')
  })
})

describe('choosePhoto', () => {
  const photo = (id: number, license: string | null, extra: Partial<ObservationPhoto> = {}): ObservationPhoto => ({
    id,
    license_code: license,
    url: `https://inaturalist-open-data.s3.amazonaws.com/photos/${id}/square.jpg`,
    attribution: `(c) Person ${id}, some rights reserved (CC BY)`,
    original_dimensions: { width: 2048, height: 1536 },
    ...extra,
  })
  const obs = (id: number, photos: ObservationPhoto[], faves = 0): Observation => ({
    id,
    uri: `https://www.inaturalist.org/observations/${id}`,
    faves_count: faves,
    user: { login: `user${id}`, name: null },
    photos,
  })

  it('skips photos that are not CC0/CC-BY', () => {
    const chosen = choosePhoto([obs(1, [photo(10, 'cc-by-nc')]), obs(2, [photo(20, 'cc0')])])
    expect(chosen).toMatchObject({ photoId: 20, license: 'CC0', sourceUrl: 'https://www.inaturalist.org/observations/2' })
  })

  it('prefers the most faved observation, then landscape photos', () => {
    const portrait = photo(30, 'cc-by', { original_dimensions: { width: 1000, height: 2000 } })
    expect(choosePhoto([obs(1, [photo(10, 'cc-by')]), obs(2, [photo(20, 'cc-by')], 3)])?.photoId).toBe(20)
    expect(choosePhoto([obs(1, [portrait, photo(31, 'cc-by')])])?.photoId).toBe(31)
  })

  it('prefers large originals, which are less often blurry crops, over faves', () => {
    const small = photo(40, 'cc-by', { original_dimensions: { width: 400, height: 300 } })
    expect(choosePhoto([obs(1, [small], 9), obs(2, [photo(41, 'cc-by')])])?.photoId).toBe(41)
    expect(choosePhoto([obs(1, [small])])?.photoId).toBe(40)
  })

  it('asks for the medium size and credits the photographer', () => {
    const chosen = choosePhoto([obs(1, [photo(10, 'cc-by')])])
    expect(chosen?.mediumUrl).toBe('https://inaturalist-open-data.s3.amazonaws.com/photos/10/medium.jpg')
    expect(chosen?.credit).toBe('Person 10')
  })

  it('skips flagged or hidden photos, and returns null when nothing qualifies', () => {
    expect(choosePhoto([obs(1, [photo(10, 'cc0', { hidden: true }), photo(11, 'cc0', { flags: [{}] })])])).toBeNull()
  })

  it('falls back to the observer when the attribution has no name', () => {
    expect(creditFromAttribution('no attribution', 'user1')).toBe('user1')
    expect(creditFromAttribution('(c) Ana Lima, no rights reserved (CC0)', 'x')).toBe('Ana Lima')
  })
})
