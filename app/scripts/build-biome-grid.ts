/**
 * Builds the bundled location → Biome lookup from RESOLVE Ecoregions 2017 (CC-BY 4.0).
 *
 * Outputs (both committed):
 *   src/assets/biomes/ecoregion-grid.bin   world grid of RESOLVE ECO_IDs, one per 0.1° cell
 *   src/domain/ecoregionBiomes.ts          ECO_ID → Biome id, from the curated groups in brazil-biome-ecoregions.ts
 *
 * Regenerate (Node ≥ 22.18, for TypeScript type stripping):
 *   curl -LO https://storage.googleapis.com/teow2016/Ecoregions2017.zip && unzip Ecoregions2017.zip
 *   npm run build:biome-grid -- path/to/Ecoregions2017.shp
 *
 * The 149 MB source is not committed. Grid format: see src/domain/biomeLookup.ts. Attribution: src/assets/biomes/LICENSE.md.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import { BRAZIL_BIOME_ECOREGIONS } from './brazil-biome-ecoregions.ts'

const CELLS_PER_DEGREE = 10
const ROWS = 180 * CELLS_PER_DEGREE // row 0 is the northernmost band
const COLS = 360 * CELLS_PER_DEGREE // col 0 starts at 180°W
// Water cells within this many cells of land take the nearest land ecoregion, so a coastal or
// lakeside city whose 0.1° cell center falls on water (Recife, Porto Alegre) still resolves.
const LAND_FILL_RADIUS = 3
const NO_ECOREGION = 0xffff

// Must match src/domain/biomeLookup.ts.
const GRID_MAGIC = 'ECOG'
const GRID_VERSION = 1
const GRID_HEADER_BYTES = 16

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const GRID_OUT = join(appRoot, 'src/assets/biomes/ecoregion-grid.bin')
const TABLE_OUT = join(appRoot, 'src/domain/ecoregionBiomes.ts')

interface Ecoregion {
  id: number
  name: string
}

type Ring = Float64Array // x0, y0, x1, y1, …

/** Minimal dBASE III reader: just the ECO_ID and ECO_NAME columns, in record order. */
function readEcoregions(dbfPath: string): Ecoregion[] {
  const buf = readFileSync(dbfPath)
  const count = buf.readUInt32LE(4)
  const headerLength = buf.readUInt16LE(8)
  const recordLength = buf.readUInt16LE(10)

  const fields = new Map<string, { offset: number; length: number }>()
  let offset = 1 // each record starts with a deletion flag byte
  for (let pos = 32; buf[pos] !== 0x0d; pos += 32) {
    const name = buf.toString('latin1', pos, pos + 11).replace(/\0.*$/s, '')
    const length = buf[pos + 16]
    fields.set(name, { offset, length })
    offset += length
  }

  const read = (record: number, field: string) => {
    const f = fields.get(field)
    if (!f) throw new Error(`DBF has no ${field} column`)
    const start = headerLength + record * recordLength + f.offset
    return buf.toString('latin1', start, start + f.length).trim()
  }

  return Array.from({ length: count }, (_, i) => ({ id: Number(read(i, 'ECO_ID')), name: read(i, 'ECO_NAME') }))
}

/** Minimal ESRI shapefile reader for Polygon (type 5) records: each record's rings. */
function* readPolygons(shpPath: string): Generator<Ring[]> {
  const buf = readFileSync(shpPath)
  let pos = 100
  while (pos < buf.length) {
    const contentBytes = buf.readInt32BE(pos + 4) * 2
    const start = pos + 8
    const shapeType = buf.readInt32LE(start)
    if (shapeType === 0) {
      yield []
    } else {
      if (shapeType !== 5) throw new Error(`Unsupported shape type ${shapeType}`)
      const numParts = buf.readInt32LE(start + 36)
      const numPoints = buf.readInt32LE(start + 40)
      const partsAt = start + 44
      const pointsAt = partsAt + numParts * 4
      const rings: Ring[] = []
      for (let p = 0; p < numParts; p++) {
        const from = buf.readInt32LE(partsAt + p * 4)
        const to = p + 1 < numParts ? buf.readInt32LE(partsAt + (p + 1) * 4) : numPoints
        const ring = new Float64Array((to - from) * 2)
        for (let i = 0; i < ring.length; i++) ring[i] = buf.readDoubleLE(pointsAt + (from * 2 + i) * 8)
        rings.push(ring)
      }
      yield rings
    }
    pos = start + contentBytes
  }
}

const rowCenterLat = (row: number) => 90 - (row + 0.5) / CELLS_PER_DEGREE

/** Scanline fill (even-odd, so holes stay empty): every cell whose center lies inside the polygon. */
function rasterize(grid: Uint16Array, rings: Ring[], value: number) {
  const crossings = new Map<number, number[]>()
  for (const ring of rings) {
    for (let i = 0; i + 3 < ring.length; i += 2) {
      const [x1, y1, x2, y2] = [ring[i], ring[i + 1], ring[i + 2], ring[i + 3]]
      if (y1 === y2) continue
      const top = Math.max(0, Math.ceil((90 - Math.max(y1, y2)) * CELLS_PER_DEGREE - 0.5))
      const bottom = Math.min(ROWS - 1, Math.floor((90 - Math.min(y1, y2)) * CELLS_PER_DEGREE - 0.5))
      for (let row = top; row <= bottom; row++) {
        const lat = rowCenterLat(row)
        // Half-open in y so a vertex shared by two edges is counted once.
        if (y1 > lat === y2 > lat) continue
        const x = x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1)
        let xs = crossings.get(row)
        if (!xs) crossings.set(row, (xs = []))
        xs.push(x)
      }
    }
  }
  for (const [row, xs] of crossings) {
    xs.sort((a, b) => a - b)
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const from = Math.max(0, Math.ceil((xs[i] + 180) * CELLS_PER_DEGREE - 0.5))
      const to = Math.min(COLS, Math.ceil((xs[i + 1] + 180) * CELLS_PER_DEGREE - 0.5))
      grid.fill(value, row * COLS + from, row * COLS + to)
    }
  }
}

/** Grows land into adjacent water cells, one ring per step, up to LAND_FILL_RADIUS (longitude wraps). */
function fillNearestLand(grid: Uint16Array) {
  for (let step = 0; step < LAND_FILL_RADIUS; step++) {
    const next = grid.slice()
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i = row * COLS + col
        if (grid[i] !== NO_ECOREGION) continue
        const neighbours = [
          row > 0 ? i - COLS : -1,
          row < ROWS - 1 ? i + COLS : -1,
          row * COLS + ((col + COLS - 1) % COLS),
          row * COLS + ((col + 1) % COLS),
        ]
        for (const n of neighbours) {
          if (n >= 0 && grid[n] !== NO_ECOREGION) {
            next[i] = grid[n]
            break
          }
        }
      }
    }
    grid.set(next)
  }
}

function encodeGrid(grid: Uint16Array): Buffer {
  const header = Buffer.alloc(GRID_HEADER_BYTES)
  header.write(GRID_MAGIC, 0, 'latin1')
  header.writeUInt16LE(GRID_VERSION, 4)
  header.writeUInt16LE(CELLS_PER_DEGREE, 6)
  header.writeUInt16LE(ROWS, 8)
  header.writeUInt16LE(COLS, 10)
  header.writeUInt16LE(NO_ECOREGION, 12)
  const cells = Buffer.alloc(grid.length * 2)
  grid.forEach((v, i) => cells.writeUInt16LE(v, i * 2))
  return Buffer.concat([header, deflateSync(cells, { level: 9 })])
}

function buildBiomeTable(ecoregions: Ecoregion[]): string {
  const idByName = new Map(ecoregions.map((e) => [e.name, e.id]))
  const lines: string[] = []
  for (const [biome, names] of Object.entries(BRAZIL_BIOME_ECOREGIONS)) {
    for (const name of names) {
      const id = idByName.get(name)
      if (id === undefined) throw new Error(`Unknown RESOLVE ecoregion "${name}" (${biome})`)
      lines.push(`  ${id}: '${biome}', // ${name}`)
    }
  }
  return `// Generated by scripts/build-biome-grid.ts from RESOLVE Ecoregions 2017 (CC-BY 4.0) — do not edit.
// Edit the curated groups in scripts/brazil-biome-ecoregions.ts and regenerate instead.
import type { BiomeId } from './biome'

/** RESOLVE ECO_ID → EcoFoco Biome. Ecoregions not listed are unsupported for now. */
export const ECOREGION_BIOMES: Readonly<Record<number, BiomeId>> = {
${lines.join('\n')}
}
`
}

function main() {
  const shpPath = process.argv[2]
  if (!shpPath?.endsWith('.shp')) {
    console.error('Usage: npm run build:biome-grid -- path/to/Ecoregions2017.shp')
    process.exit(1)
  }
  const ecoregions = readEcoregions(join(dirname(shpPath), `${basename(shpPath, '.shp')}.dbf`))

  const grid = new Uint16Array(ROWS * COLS).fill(NO_ECOREGION)
  let record = 0
  for (const rings of readPolygons(shpPath)) rasterize(grid, rings, ecoregions[record++].id)
  if (record !== ecoregions.length) throw new Error(`SHP has ${record} records, DBF has ${ecoregions.length}`)
  fillNearestLand(grid)

  const encoded = encodeGrid(grid)
  writeFileSync(GRID_OUT, encoded)
  writeFileSync(TABLE_OUT, buildBiomeTable(ecoregions))
  console.log(`Wrote ${GRID_OUT} (${(encoded.length / 1024).toFixed(0)} KB) and ${TABLE_OUT}`)
}

main()
