// Biome presence from GBIF occurrences, judged with the same RESOLVE ecoregion grid the app uses for location.
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import type { BiomeId } from '../../src/domain/catalogSchema.ts'
import { ECOREGION_BIOMES } from '../../src/domain/ecoregionBiomes.ts'
import { BRAZIL_BOUNDS } from './config.ts'

// Grid layout: see src/domain/biomeLookup.ts (which decodes it in the browser with DecompressionStream).
interface Grid {
  cellsPerDegree: number
  rows: number
  cols: number
  noEcoregion: number
  cells: Uint16Array
}

export function readGrid(path: string): Grid {
  const file = readFileSync(path)
  if (file.toString('latin1', 0, 4) !== 'ECOG' || file.readUInt16LE(4) !== 1) throw new Error('Unrecognized ecoregion grid')
  const rows = file.readUInt16LE(8)
  const cols = file.readUInt16LE(10)
  const inflated = inflateSync(file.subarray(16))
  const cells = new Uint16Array(rows * cols)
  for (let i = 0; i < cells.length; i++) cells[i] = inflated.readUInt16LE(i * 2)
  return { cellsPerDegree: file.readUInt16LE(6), rows, cols, noEcoregion: file.readUInt16LE(12), cells }
}

export function biomeAt(grid: Grid, lat: number, lng: number): BiomeId | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng >= 180) return null
  const row = Math.min(grid.rows - 1, Math.floor((90 - lat) * grid.cellsPerDegree))
  const col = Math.min(grid.cols - 1, Math.floor((lng + 180) * grid.cellsPerDegree))
  const id = grid.cells[row * grid.cols + col]
  return id === grid.noEcoregion ? null : (ECOREGION_BIOMES[id] ?? null)
}

export interface Bounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

/** Bounding box of a Biome's cells within Brazil, where its GBIF occurrences are sampled. */
export function biomeBounds(grid: Grid, biome: BiomeId): Bounds {
  const step = 1 / grid.cellsPerDegree
  let box: Bounds | null = null
  for (let lat = BRAZIL_BOUNDS.minLat; lat <= BRAZIL_BOUNDS.maxLat; lat += step) {
    for (let lng = BRAZIL_BOUNDS.minLng; lng <= BRAZIL_BOUNDS.maxLng; lng += step) {
      if (biomeAt(grid, lat, lng) !== biome) continue
      box = box
        ? {
            minLat: Math.min(box.minLat, lat),
            maxLat: Math.max(box.maxLat, lat),
            minLng: Math.min(box.minLng, lng),
            maxLng: Math.max(box.maxLng, lng),
          }
        : { minLat: lat, maxLat: lat, minLng: lng, maxLng: lng }
    }
  }
  if (!box) throw new Error(`No grid cells for ${biome}`)
  const round = (n: number) => Math.round(n * 10) / 10
  return {
    minLat: round(box.minLat - step),
    maxLat: round(box.maxLat + step),
    minLng: round(box.minLng - step),
    maxLng: round(box.maxLng + step),
  }
}

export interface Occurrence {
  decimalLatitude?: number
  decimalLongitude?: number
  datasetKey: string
}

/** The occurrences that fall inside the Biome's ecoregions. */
export function inBiome<T extends Occurrence>(grid: Grid, biome: BiomeId, occurrences: T[]): T[] {
  return occurrences.filter(
    (o) =>
      o.decimalLatitude !== undefined &&
      o.decimalLongitude !== undefined &&
      biomeAt(grid, o.decimalLatitude, o.decimalLongitude) === biome,
  )
}
