import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { tileCenter, tileFillOrder } from '../domain/iso'
import type { CollectedEntry } from '../domain/types'
import { IsometricGarden } from './IsometricGarden'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Must match the scene geometry in IsometricGarden for a 6×6 plot.
const TILE = { width: 64, height: 32 }
const SCENE_WIDTH = 6 * TILE.width + 2 * 8
const ORIGIN = { x: SCENE_WIDTH / 2, y: 100 }

const entry = (id: string, speciesId: string, collectedAt: string): CollectedEntry => ({
  id,
  speciesId,
  collectedAt,
  method: 'focus_session',
})

describe('IsometricGarden', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  function render(entries: CollectedEntry[], onSelectSpecies: (id: string) => void) {
    act(() => root.render(<IsometricGarden entries={entries} onSelectSpecies={onSelectSpecies} />))
    const scene = container.querySelector<HTMLDivElement>('[role="group"]')!
    // Render the scene at its logical size so client coordinates equal scene coordinates.
    scene.getBoundingClientRect = () => ({ left: 0, top: 0, width: SCENE_WIDTH }) as DOMRect
    return scene
  }

  function clickTile(scene: HTMLElement, col: number, row: number) {
    const center = tileCenter({ col, row }, TILE)
    act(() => {
      scene.dispatchEvent(
        new MouseEvent('click', { bubbles: true, clientX: ORIGIN.x + center.x, clientY: ORIGIN.y + center.y }),
      )
    })
  }

  it('opens the species placed on the tapped tile', () => {
    const onSelect = vi.fn()
    const scene = render(
      [entry('a', 'ipe-amarelo', '2026-10-02T10:00:00.000Z'), entry('b', 'quati', '2026-10-02T11:00:00.000Z')],
      onSelect,
    )
    const [first, second] = tileFillOrder(6)

    clickTile(scene, first.col, first.row)
    clickTile(scene, second.col, second.row)

    expect(onSelect.mock.calls).toEqual([['ipe-amarelo'], ['quati']])
  })

  it('places entries in collection order, regardless of input order', () => {
    const onSelect = vi.fn()
    const scene = render(
      [entry('b', 'quati', '2026-10-02T11:00:00.000Z'), entry('a', 'ipe-amarelo', '2026-10-02T10:00:00.000Z')],
      onSelect,
    )
    const [first] = tileFillOrder(6)

    clickTile(scene, first.col, first.row)

    expect(onSelect).toHaveBeenCalledWith('ipe-amarelo')
  })

  it('ignores taps on empty tiles and off the plot', () => {
    const onSelect = vi.fn()
    const scene = render([entry('a', 'ipe-amarelo', '2026-10-02T10:00:00.000Z')], onSelect)
    const empty = tileFillOrder(6)[1]

    clickTile(scene, empty.col, empty.row)
    clickTile(scene, -1, 0)

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('skips entries for species missing from the catalog', () => {
    render([entry('x', 'not-a-species', '2026-10-02T10:00:00.000Z')], vi.fn())
    expect(container.querySelectorAll('ul button')).toHaveLength(0)
  })

  it('offers an accessible button per placed entry', () => {
    const onSelect = vi.fn()
    render([entry('a', 'quati', '2026-10-02T10:00:00.000Z')], onSelect)

    const button = container.querySelector<HTMLButtonElement>('ul button')!
    expect(button.textContent).toBe('South American Coati')
    act(() => button.click())
    expect(onSelect).toHaveBeenCalledWith('quati')
  })
})
