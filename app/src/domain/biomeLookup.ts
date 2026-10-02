import type { BiomeId } from './biome'
import { ECOREGION_BIOMES } from './ecoregionBiomes'

// Grid file layout (written by scripts/build-biome-grid.ts), all little-endian:
//   0  "ECOG"   4  u16 version   6  u16 cells per degree   8  u16 rows   10  u16 cols   12  u16 no-ecoregion value
//   16 zlib-deflated u16 RESOLVE ECO_ID per cell, row-major from the north-west corner (90°N, 180°W).
const GRID_HEADER_BYTES = 16
const GRID_MAGIC = 'ECOG'
const GRID_VERSION = 1

export interface EcoregionGrid {
  cellsPerDegree: number
  rows: number
  cols: number
  noEcoregion: number
  cells: Uint16Array
}

/** Parses the bundled grid file (header + zlib-deflated cells). */
export async function decodeGrid(file: ArrayBuffer): Promise<EcoregionGrid> {
  const header = new DataView(file, 0, GRID_HEADER_BYTES)
  const magic = String.fromCharCode(...new Uint8Array(file, 0, 4))
  if (magic !== GRID_MAGIC || header.getUint16(4, true) !== GRID_VERSION) throw new Error('Unrecognized ecoregion grid')
  const rows = header.getUint16(8, true)
  const cols = header.getUint16(10, true)

  const deflated = new Response(new Uint8Array(file, GRID_HEADER_BYTES)).body!
  const inflated = new DataView(await new Response(deflated.pipeThrough(new DecompressionStream('deflate'))).arrayBuffer())
  if (inflated.byteLength !== rows * cols * 2) throw new Error('Ecoregion grid size does not match its header')
  const cells = new Uint16Array(rows * cols)
  for (let i = 0; i < cells.length; i++) cells[i] = inflated.getUint16(i * 2, true)

  return { cellsPerDegree: header.getUint16(6, true), rows, cols, noEcoregion: header.getUint16(12, true), cells }
}

/** RESOLVE ECO_ID of the cell containing the point, or null over open water / out of range. */
export function ecoregionAt(grid: EcoregionGrid, lat: number, lng: number): number | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90) return null
  const row = Math.min(grid.rows - 1, Math.floor((90 - lat) * grid.cellsPerDegree))
  const wrappedLng = ((((lng + 180) % 360) + 360) % 360) - 180
  const col = Math.min(grid.cols - 1, Math.floor((wrappedLng + 180) * grid.cellsPerDegree))
  const id = grid.cells[row * grid.cols + col]
  return id === grid.noEcoregion ? null : id
}

/** The Biome a location falls in, or 'unsupported' where no curated Biome covers it yet. */
export function biomeAt(
  grid: EcoregionGrid,
  lat: number,
  lng: number,
  table: Readonly<Record<number, BiomeId>> = ECOREGION_BIOMES,
): BiomeId | 'unsupported' {
  const id = ecoregionAt(grid, lat, lng)
  return (id !== null && table[id]) || 'unsupported'
}
