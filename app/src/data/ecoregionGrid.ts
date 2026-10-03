import gridUrl from '../assets/biomes/ecoregion-grid.bin?url'
import { decodeGrid, type EcoregionGrid } from '../domain/biomeLookup'

let gridPromise: Promise<EcoregionGrid> | null = null

async function fetchGrid(): Promise<EcoregionGrid> {
  const res = await fetch(gridUrl)
  if (!res.ok) throw new Error(`Failed to load the biome map (${res.status})`)
  return decodeGrid(await res.arrayBuffer())
}

/** The bundled RESOLVE ecoregion grid (~13 MB once inflated), loaded on first use. */
export function loadEcoregionGrid(): Promise<EcoregionGrid> {
  if (!gridPromise) {
    gridPromise = fetchGrid().catch((err: unknown) => {
      gridPromise = null
      throw err
    })
  }
  return gridPromise
}
