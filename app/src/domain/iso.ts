// Isometric math for the garden view: a square plot of tiles drawn as a 2:1 diamond grid.
// Screen coordinates are relative to the plot origin, the top vertex of tile (0, 0).

export interface TilePos {
  col: number
  row: number
}

export interface Point {
  x: number
  y: number
}

export interface TileSize {
  width: number
  height: number
}

export const MIN_PLOT_SIZE = 6
export const MAX_PLOT_SIZE = 8

/** Top vertex of a tile's diamond. */
export function tileToScreen({ col, row }: TilePos, tile: TileSize): Point {
  return {
    x: ((col - row) * tile.width) / 2,
    y: ((col + row) * tile.height) / 2,
  }
}

/** Center of a tile's diamond — where sprites stand. */
export function tileCenter(pos: TilePos, tile: TileSize): Point {
  const top = tileToScreen(pos, tile)
  return { x: top.x, y: top.y + tile.height / 2 }
}

/** Inverse projection: the tile whose diamond contains the point (may be outside the plot). */
export function screenToTile({ x, y }: Point, tile: TileSize): TilePos {
  const u = x / (tile.width / 2)
  const v = y / (tile.height / 2)
  return {
    col: Math.floor((v + u) / 2),
    row: Math.floor((v - u) / 2),
  }
}

/** Tap picking by tile footprint (not sprite bounds); null when the point is off the plot. */
export function pickTile(point: Point, tile: TileSize, plotSize: number): TilePos | null {
  const pos = screenToTile(point, tile)
  const inside = pos.col >= 0 && pos.row >= 0 && pos.col < plotSize && pos.row < plotSize
  return inside ? pos : null
}

/** Painter's order: back-to-front, so later items are drawn over earlier ones. */
export function depthSort<T extends TilePos>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.col + a.row - (b.col + b.row) || a.col - b.col)
}

/** Smallest square plot that fits `count` items, clamped to the 6×6–8×8 range. */
export function plotSizeFor(count: number): number {
  for (let size = MIN_PLOT_SIZE; size < MAX_PLOT_SIZE; size++) {
    if (count <= size * size) return size
  }
  return MAX_PLOT_SIZE
}

/** Stable pseudo-random value in [0, 1) for a tile, so layouts don't change between renders. */
export function tileNoise({ col, row }: TilePos): number {
  let h = Math.imul(col + 1, 0x9e3779b1) ^ Math.imul(row + 1, 0x85ebca77)
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d)
  h ^= h >>> 12
  return (h >>> 0) / 0x100000000
}

/**
 * Order in which tiles are filled: roughly center-out with a little stable jitter, so a few
 * items form a grove in the middle and more items spread towards the edges.
 */
export function tileFillOrder(plotSize: number): TilePos[] {
  const mid = (plotSize - 1) / 2
  const tiles: { pos: TilePos; score: number }[] = []
  for (let row = 0; row < plotSize; row++) {
    for (let col = 0; col < plotSize; col++) {
      const pos = { col, row }
      const distance = Math.hypot(col - mid, row - mid)
      tiles.push({ pos, score: distance + tileNoise(pos) * 1.5 })
    }
  }
  return tiles.sort((a, b) => a.score - b.score).map((t) => t.pos)
}

export interface Placement<T> extends TilePos {
  item: T
}

export interface PlotLayout<T> {
  plotSize: number
  placements: Placement<T>[]
  /** Earliest items that did not fit on the largest plot. */
  overflow: number
}

/**
 * Places items onto a bounded plot, one per tile, in the given order. Earlier items keep their
 * tile when more are appended (as long as the plot size doesn't change). When the largest plot is
 * full, the earliest items are dropped so the latest ones stay visible.
 */
export function placeOnPlot<T>(items: readonly T[]): PlotLayout<T> {
  const plotSize = plotSizeFor(items.length)
  const order = tileFillOrder(plotSize)
  const overflow = Math.max(0, items.length - order.length)
  const placements = items.slice(overflow).map((item, i) => ({ item, ...order[i] }))
  return { plotSize, placements, overflow }
}
