import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
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
vi.mock('../data/collectionRepo', () => ({ listCollectedEntries, addCollectedEntry: vi.fn() }))
vi.mock('../data/settingsRepo', () => ({ setCollectionView }))
vi.mock('../data/haptics', () => ({ lightHaptic: vi.fn() }))
vi.mock('@capacitor/app', () => ({
  App: { addListener: () => Promise.resolve({ remove: vi.fn() }) },
}))

const entries: CollectedEntry[] = [
  { id: 'e1', speciesId: 'ipe-amarelo', collectedAt: new Date().toISOString(), method: 'focus_session' },
]

describe('CollectionScreen', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    listCollectedEntries.mockResolvedValue(entries)
    setCollectionView.mockClear()
    useSettingsStore.setState({ collectionView: 'grid' })
    useCollectionStore.setState({ entries: [], loaded: false })
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
    const tile = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Yellow Trumpet Tree')!
    act(() => tile.click())

    expect(dialog()).not.toBeNull()
    expect(dialog()!.textContent).toContain('Handroanthus albus')
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
      (b) => b.textContent === 'Yellow Trumpet Tree',
    ) as HTMLButtonElement
    act(() => plant.click())

    expect(dialog()?.textContent).toContain('Handroanthus albus')
  })
})
