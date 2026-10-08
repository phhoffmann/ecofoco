import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { SPECIES_CATALOG } from '../domain/species'
import type { CollectedEntry } from '../domain/types'
import { useCollectionStore } from '../stores/collectionStore'
import { useSettingsStore } from '../stores/settingsStore'
import { CollectionScreen } from './CollectionScreen'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { listCollectedEntries, setCollectionView } = vi.hoisted(() => ({
  listCollectedEntries: vi.fn(),
  setCollectionView: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../data/collectionRepo', () => ({ listCollectedEntries, addCollectedEntry: vi.fn(), deleteCollectedEntry: vi.fn() }))
vi.mock('../data/settingsRepo', () => ({ setCollectionView }))
vi.mock('../data/haptics', () => ({ lightHaptic: vi.fn() }))
vi.mock('@capacitor/app', () => ({
  App: { addListener: () => Promise.resolve({ remove: vi.fn() }) },
}))

const entries: CollectedEntry[] = [
  { id: 'e1', speciesId: 'quaresmeira', collectedAt: new Date().toISOString(), method: 'focus_session' },
]

describe('CollectionScreen', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    listCollectedEntries.mockResolvedValue(entries)
    setCollectionView.mockClear()
    useSettingsStore.setState({ collectionView: 'grid' })
    useCollectionStore.setState({ entries: [], loaded: false, highlightSpeciesId: null })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => root.render(<CollectionScreen />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.useRealTimers()
  })

  const viewToggle = () => container.querySelector<HTMLElement>('[role="group"][aria-label="Collection view"]')!
  const toggleButton = (label: string) =>
    [...viewToggle().querySelectorAll('button')].find((b) => b.textContent === label)!
  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')

  it('puts the grid/garden toggle at the top of the screen', () => {
    expect(container.firstElementChild?.firstElementChild).toBe(viewToggle())
    expect(toggleButton('Grid').getAttribute('aria-pressed')).toBe('true')
    expect(toggleButton('Garden').getAttribute('aria-pressed')).toBe('false')
  })

  it('switches to the garden and persists the choice', async () => {
    await act(async () => toggleButton('Garden').click())

    expect(setCollectionView).toHaveBeenCalledWith('isometric')
    expect(useSettingsStore.getState().collectionView).toBe('isometric')
    expect(toggleButton('Garden').getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelector('[aria-label="Garden of the species collected in this period"]')).not.toBeNull()
  })

  it('opens a collected grid tile as a species sheet and closes it again', () => {
    const tile = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Glory Bush Tree')!
    act(() => tile.click())

    expect(dialog()).not.toBeNull()
    expect(dialog()!.textContent).toContain('Pleroma granulosum')
    expect(dialog()!.textContent).toContain('Focus session')

    const close = [...dialog()!.querySelectorAll('button')].find((b) => b.textContent === 'Close')!
    act(() => close.click())
    act(() => vi.advanceTimersByTime(250))
    expect(dialog()).toBeNull()
  })

  it('opens the species sheet from a garden tap', async () => {
    await act(async () => toggleButton('Garden').click())
    // The garden's accessible list mirrors tile taps (see IsometricGarden tests for pointer picking).
    const plant = [...container.querySelectorAll('.sr-only button')].find(
      (b) => b.textContent === 'Glory Bush Tree',
    ) as HTMLButtonElement
    act(() => plant.click())

    expect(dialog()?.textContent).toContain('Pleroma granulosum')
  })

  it('labels collected and undiscovered tiles for screen readers', () => {
    expect(container.querySelector('[aria-label="Glory Bush Tree, collected once"]')).not.toBeNull()
    expect(container.querySelectorAll('[role="img"][aria-label="Undiscovered plant"]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('[role="img"][aria-label="Undiscovered animal"]').length).toBeGreaterThan(0)
  })
})

describe('CollectionScreen grid ordering and filters', () => {
  const atlantic = SPECIES_CATALOG.filter((s) => s.biome.includes('atlantic-forest'))
  const [olderPlant, newerPlant] = atlantic.filter((s) => s.type === 'plant' && s.id !== 'quaresmeira')
  const animal = atlantic.find((s) => s.type === 'animal')!
  const at = (minute: number) => new Date(Date.UTC(2026, 8, 10, 10, minute)).toISOString()
  const many: CollectedEntry[] = [
    { id: 'a', speciesId: olderPlant.id, collectedAt: at(1), method: 'focus_session' },
    { id: 'b', speciesId: olderPlant.id, collectedAt: at(2), method: 'focus_session' },
    { id: 'c', speciesId: olderPlant.id, collectedAt: at(3), method: 'focus_session' },
    { id: 'd', speciesId: animal.id, collectedAt: at(4), method: 'draw' },
    { id: 'e', speciesId: newerPlant.id, collectedAt: at(5), method: 'manual_sighting' },
  ]
  let container: HTMLDivElement
  let root: Root
  const scrollIntoView = vi.fn()

  async function render(highlightSpeciesId: string | null = null, stored = many) {
    listCollectedEntries.mockResolvedValue(stored)
    useSettingsStore.setState({ collectionView: 'grid' })
    useCollectionStore.setState({ entries: [], loaded: false, highlightSpeciesId })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => root.render(<CollectionScreen />))
  }

  beforeEach(() => {
    scrollIntoView.mockClear()
    Element.prototype.scrollIntoView = scrollIntoView
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const tiles = () => [...container.querySelectorAll<HTMLElement>('ul > li > *')]
  const filter = (label: string) =>
    [...container.querySelectorAll<HTMLButtonElement>('[role="group"][aria-label="Show species"] button')].find(
      (b) => b.textContent === label,
    )!

  it('lists collected species first, most recent on top, with a ×N badge for repeats', async () => {
    await render()

    const ids = tiles().slice(0, 3).map((t) => t.dataset.speciesId)
    expect(ids).toEqual([newerPlant.id, animal.id, olderPlant.id])
    expect(tiles()[3].getAttribute('role')).toBe('img')
    expect(tiles()[2].textContent).toContain('×3')
    expect(tiles()[2].getAttribute('aria-label')).toContain('collected 3 times')
  })

  it('filters the grid to plants or animals', async () => {
    await render()

    await act(async () => filter('Animals').click())
    expect(tiles().every((t) => t.dataset.speciesId === animal.id || t.getAttribute('aria-label') === 'Undiscovered animal')).toBe(true)

    await act(async () => filter('Plants').click())
    expect(tiles().some((t) => t.dataset.speciesId === animal.id)).toBe(false)
  })

  it('highlights and scrolls to the latest catch, once', async () => {
    await render(newerPlant.id)

    const tile = container.querySelector<HTMLElement>(`[data-species-id="${newerPlant.id}"]`)!
    expect(tile.className).toContain('catch-highlight')
    expect(tile.textContent).toContain('New')
    expect(scrollIntoView).toHaveBeenCalled()
    expect(useCollectionStore.getState().highlightSpeciesId).toBeNull()
  })

  it('puts the empty state above the grid when nothing is collected yet', async () => {
    await render(null, [])

    const empty = [...container.querySelectorAll('p')].find((p) => p.textContent === 'Complete a focus session to collect your first species.')!
    const grid = container.querySelector('ul')!
    expect(empty.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
