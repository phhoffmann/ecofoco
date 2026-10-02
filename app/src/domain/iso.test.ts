import { describe, expect, it } from 'vitest'
import {
  MAX_PLOT_SIZE,
  depthSort,
  pickTile,
  placeOnPlot,
  plotSizeFor,
  screenToTile,
  tileCenter,
  tileFillOrder,
  tileNoise,
  tileToScreen,
} from './iso'

const TILE = { width: 64, height: 32 }

describe('tileToScreen', () => {
  it('puts tile (0, 0) at the origin', () => {
    expect(tileToScreen({ col: 0, row: 0 }, TILE)).toEqual({ x: 0, y: 0 })
  })

  it('moves right-down along columns and left-down along rows (2:1 diamond)', () => {
    expect(tileToScreen({ col: 1, row: 0 }, TILE)).toEqual({ x: 32, y: 16 })
    expect(tileToScreen({ col: 0, row: 1 }, TILE)).toEqual({ x: -32, y: 16 })
    expect(tileToScreen({ col: 3, row: 2 }, TILE)).toEqual({ x: 32, y: 80 })
  })

  it('tileCenter sits half a tile below the top vertex', () => {
    expect(tileCenter({ col: 2, row: 2 }, TILE)).toEqual({ x: 0, y: 80 })
  })
})

describe('screenToTile', () => {
  it('inverts the projection at every tile center', () => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        expect(screenToTile(tileCenter({ col, row }, TILE), TILE)).toEqual({ col, row })
      }
    }
  })

  it('resolves points near a diamond edge to the tile they fall inside', () => {
    // Just inside tile (0,0)'s right vertex vs. just past it, below the edge, into tile (1,0).
    expect(screenToTile({ x: 31, y: 16 }, TILE)).toEqual({ col: 0, row: 0 })
    expect(screenToTile({ x: 33, y: 18 }, TILE)).toEqual({ col: 1, row: 0 })
    // Inside tile (0,0)'s bounding box but outside its diamond (top-left corner).
    expect(screenToTile({ x: -28, y: 2 }, TILE)).toEqual({ col: -1, row: 0 })
  })
})

describe('pickTile', () => {
  it('returns the tile under the point when it is on the plot', () => {
    expect(pickTile(tileCenter({ col: 5, row: 1 }, TILE), TILE, 6)).toEqual({ col: 5, row: 1 })
  })

  it('returns null outside the plot', () => {
    expect(pickTile({ x: 0, y: -4 }, TILE, 6)).toBeNull()
    expect(pickTile(tileCenter({ col: 6, row: 0 }, TILE), TILE, 6)).toBeNull()
    expect(pickTile(tileCenter({ col: 0, row: 6 }, TILE), TILE, 6)).toBeNull()
  })
})

describe('depthSort', () => {
  it('orders back-to-front by col + row, then by col', () => {
    const items = [
      { col: 2, row: 2, id: 'front' },
      { col: 0, row: 0, id: 'back' },
      { col: 2, row: 0, id: 'mid-right' },
      { col: 0, row: 2, id: 'mid-left' },
      { col: 1, row: 1, id: 'mid-center' },
    ]
    expect(depthSort(items).map((i) => i.id)).toEqual(['back', 'mid-left', 'mid-center', 'mid-right', 'front'])
  })

  it('does not mutate its input', () => {
    const items = [
      { col: 1, row: 1 },
      { col: 0, row: 0 },
    ]
    depthSort(items)
    expect(items[0]).toEqual({ col: 1, row: 1 })
  })
})

describe('plotSizeFor', () => {
  it('stays at 6×6 for up to 36 items', () => {
    expect(plotSizeFor(0)).toBe(6)
    expect(plotSizeFor(36)).toBe(6)
  })

  it('grows to 7×7 and then 8×8', () => {
    expect(plotSizeFor(37)).toBe(7)
    expect(plotSizeFor(49)).toBe(7)
    expect(plotSizeFor(50)).toBe(8)
  })

  it('never exceeds 8×8', () => {
    expect(plotSizeFor(500)).toBe(MAX_PLOT_SIZE)
  })
})

describe('tileNoise', () => {
  it('is deterministic and in [0, 1)', () => {
    for (let i = 0; i < 64; i++) {
      const pos = { col: i % 8, row: Math.floor(i / 8) }
      const n = tileNoise(pos)
      expect(n).toBe(tileNoise(pos))
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
    }
  })
})

describe('tileFillOrder', () => {
  it('visits every tile of the plot exactly once', () => {
    const order = tileFillOrder(7)
    expect(order).toHaveLength(49)
    expect(new Set(order.map((t) => `${t.col},${t.row}`)).size).toBe(49)
  })

  it('starts near the center and ends near the edges', () => {
    const order = tileFillOrder(6)
    const [first] = order
    const last = order[order.length - 1]
    expect([2, 3]).toContain(first.col)
    expect([2, 3]).toContain(first.row)
    expect(Math.hypot(last.col - 2.5, last.row - 2.5)).toBeGreaterThan(2.5)
  })
})

describe('placeOnPlot', () => {
  it('places each item on its own tile, in fill order', () => {
    const layout = placeOnPlot(['a', 'b', 'c'])
    expect(layout.plotSize).toBe(6)
    expect(layout.overflow).toBe(0)
    const order = tileFillOrder(6)
    expect(layout.placements).toEqual([
      { item: 'a', ...order[0] },
      { item: 'b', ...order[1] },
      { item: 'c', ...order[2] },
    ])
  })

  it('keeps earlier items on the same tile when more are appended', () => {
    const before = placeOnPlot(['a', 'b'])
    const after = placeOnPlot(['a', 'b', 'c', 'd'])
    expect(after.placements.slice(0, 2)).toEqual(before.placements)
  })

  it('grows the plot to fit more items', () => {
    const layout = placeOnPlot(Array.from({ length: 40 }, (_, i) => i))
    expect(layout.plotSize).toBe(7)
    expect(layout.placements).toHaveLength(40)
  })

  it('reports items that do not fit on the largest plot as overflow', () => {
    const layout = placeOnPlot(Array.from({ length: 70 }, (_, i) => i))
    expect(layout.plotSize).toBe(8)
    expect(layout.placements).toHaveLength(64)
    expect(layout.overflow).toBe(6)
  })
})
