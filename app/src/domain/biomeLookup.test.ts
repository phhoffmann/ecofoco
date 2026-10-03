import { beforeAll, describe, expect, it } from 'vitest'
import gridDataUrl from '../assets/biomes/ecoregion-grid.bin?inline'
import { biomeAt, decodeGrid, ecoregionAt, type EcoregionGrid } from './biomeLookup'

const NONE = 0xffff

// 1 cell per degree, 2 rows × 4 cols: rows cover 90°N–88°N, cols 180°W–176°W.
const fixture: EcoregionGrid = {
  cellsPerDegree: 1,
  rows: 2,
  cols: 4,
  noEcoregion: NONE,
  cells: Uint16Array.from([1, 2, 3, NONE, 4, 5, 6, 7]),
}

describe('ecoregionAt', () => {
  it('maps lat/lng to the containing cell, north-west first', () => {
    expect(ecoregionAt(fixture, 89.5, -179.5)).toBe(1)
    expect(ecoregionAt(fixture, 89.5, -177.5)).toBe(3)
    expect(ecoregionAt(fixture, 88.5, -176.5)).toBe(7)
  })

  it('returns null for water cells and invalid coordinates', () => {
    expect(ecoregionAt(fixture, 89.5, -176.5)).toBeNull()
    expect(ecoregionAt(fixture, Number.NaN, 0)).toBeNull()
    expect(ecoregionAt(fixture, 91, 0)).toBeNull()
  })

  it('wraps longitude and clamps the poles and the antimeridian into the grid', () => {
    expect(ecoregionAt(fixture, 89.5, 180.5)).toBe(1)
    expect(ecoregionAt(fixture, 90, -180)).toBe(1)
  })
})

describe('biomeAt', () => {
  const table = { 1: 'caatinga', 7: 'pampa' } as const

  it('maps the ecoregion through the curated table', () => {
    expect(biomeAt(fixture, 89.5, -179.5, table)).toBe('caatinga')
    expect(biomeAt(fixture, 88.5, -176.5, table)).toBe('pampa')
  })

  it('is unsupported for unlisted ecoregions and water', () => {
    expect(biomeAt(fixture, 89.5, -178.5, table)).toBe('unsupported')
    expect(biomeAt(fixture, 89.5, -176.5, table)).toBe('unsupported')
  })
})

describe('bundled RESOLVE grid', () => {
  let grid: EcoregionGrid

  beforeAll(async () => {
    const res = await fetch(gridDataUrl)
    grid = await decodeGrid(await res.arrayBuffer())
  })

  it('rejects files that are not an ecoregion grid', async () => {
    await expect(decodeGrid(new ArrayBuffer(16))).rejects.toThrow('Unrecognized')
  })

  it.each([
    ['São Paulo', -23.55, -46.63, 'atlantic-forest'],
    ['Rio de Janeiro', -22.91, -43.17, 'atlantic-forest'],
    ['Curitiba', -25.43, -49.27, 'atlantic-forest'],
    ['Recife (coastal)', -8.05, -34.88, 'atlantic-forest'],
    ['Petrolina', -9.39, -40.5, 'caatinga'],
    ['Campina Grande', -7.23, -35.88, 'caatinga'],
    ['Fortaleza (coastal)', -3.73, -38.52, 'caatinga'],
    ['Brasília', -15.79, -47.88, 'cerrado'],
    ['Manaus', -3.12, -60.02, 'amazon'],
    ['Corumbá', -19.01, -57.65, 'pantanal'],
    ['Porto Alegre (lakeside)', -30.03, -51.23, 'pampa'],
  ] as const)('places %s in %s', (_city, lat, lng, biome) => {
    expect(biomeAt(grid, lat, lng)).toBe(biome)
  })

  it('leaves places outside Brazil’s biomes unsupported', () => {
    expect(biomeAt(grid, 38.72, -9.14)).toBe('unsupported') // Lisbon
    expect(biomeAt(grid, -20, -30)).toBe('unsupported') // open Atlantic
  })
})
