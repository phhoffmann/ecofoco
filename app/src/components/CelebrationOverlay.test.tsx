import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import type { CatchReveal } from '../domain/catch'
import { SPECIES_CATALOG, rarityIn } from '../domain/species'
import { DEFAULT_DISPLAY_PREFERENCES } from '../domain/types'
import { useCelebrationStore } from '../stores/celebrationStore'
import { useNavigationStore } from '../stores/navigationStore'
import { useSettingsStore } from '../stores/settingsStore'
import { CelebrationOverlay } from './CelebrationOverlay'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { setCollectionView } = vi.hoisted(() => ({ setCollectionView: vi.fn().mockResolvedValue(undefined) }))
vi.mock('../data/haptics', () => ({ lightHaptic: vi.fn() }))
vi.mock('../data/settingsRepo', () => ({ setCollectionView }))
vi.mock('@capacitor/app', () => ({
  App: { addListener: () => Promise.resolve({ remove: vi.fn() }) },
}))

const species = SPECIES_CATALOG.find((s) => s.id === 'quaresmeira')!
const firstCatch: CatchReveal = {
  species,
  biome: 'atlantic-forest',
  isNew: true,
  timesCollected: 1,
  dexCollected: 12,
  dexTotal: 80,
  points: 10,
}

describe('CelebrationOverlay', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.useFakeTimers()
    setCollectionView.mockClear()
    useSettingsStore.setState({ display: DEFAULT_DISPLAY_PREFERENCES, collectionView: 'grid' })
    useNavigationStore.setState({ tab: 'focus' })
    useCelebrationStore.setState({ reveal: null, seq: 0, snackbar: null, pendingUndo: null })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<CelebrationOverlay />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.useRealTimers()
  })

  const overlay = () => container.querySelector<HTMLElement>('[role="dialog"]')
  const button = (label: string) => [...overlay()!.querySelectorAll('button')].find((b) => b.textContent === label)!

  it('renders nothing until something is collected', () => {
    expect(overlay()).toBeNull()
  })

  it('reveals a first catch as new, with its rarity, Biome progress and points', () => {
    act(() => useCelebrationStore.getState().celebrate(firstCatch))

    const text = overlay()!.textContent
    expect(overlay()!.getAttribute('aria-labelledby')).toBeTruthy()
    expect(text).toContain('Glory Bush Tree')
    expect(text).toContain('New!')
    expect(text).toContain({ common: 'Common', rare: 'Rare', epic: 'Epic' }[rarityIn(species, 'atlantic-forest')])
    expect(text).toContain('12 / 80 Atlantic Forest species')
    expect(text).toContain('+10 points')
  })

  it('tells a repeat catch apart from a new one, and leaves out points it did not earn', () => {
    act(() => useCelebrationStore.getState().celebrate({ ...firstCatch, isNew: false, timesCollected: 3, points: 0 }))

    const text = overlay()!.textContent
    expect(text).toContain('Seen ×3')
    expect(text).not.toContain('New!')
    expect(text).not.toContain('points')
  })

  it('waits for the user instead of dismissing itself', () => {
    act(() => useCelebrationStore.getState().celebrate(firstCatch))

    act(() => vi.advanceTimersByTime(60_000))

    expect(overlay()).not.toBeNull()
  })

  it('Continue dismisses it', () => {
    act(() => useCelebrationStore.getState().celebrate(firstCatch))
    act(() => button('Continue').click())

    expect(overlay()).toBeNull()
    expect(useCelebrationStore.getState().reveal).toBeNull()
  })

  it('"See it in your collection" opens the Collection in the grid the user chose, keeping that choice', () => {
    act(() => useCelebrationStore.getState().celebrate(firstCatch))
    act(() => button('See it in your collection').click())

    expect(overlay()).toBeNull()
    expect(useNavigationStore.getState().tab).toBe('collection')
    expect(useSettingsStore.getState().collectionView).toBe('grid')
    expect(setCollectionView).not.toHaveBeenCalled()
  })

  it('"See it in your garden" opens the Collection when the user chose the garden view, keeping that choice', () => {
    act(() => useSettingsStore.setState({ collectionView: 'isometric' }))
    act(() => useCelebrationStore.getState().celebrate(firstCatch))
    act(() => button('See it in your garden').click())

    expect(useNavigationStore.getState().tab).toBe('collection')
    expect(useSettingsStore.getState().collectionView).toBe('isometric')
    expect(setCollectionView).not.toHaveBeenCalled()
  })

  it('moves focus to its main action, keeps Tab inside, and continues on Escape', () => {
    act(() => useCelebrationStore.getState().celebrate(firstCatch))
    const primary = button('See it in your collection')
    expect(document.activeElement).toBe(primary)

    const key = (init: KeyboardEventInit) =>
      act(() => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init })))
    key({ key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(button('Continue'))

    key({ key: 'Escape' })
    expect(overlay()).toBeNull()
  })
})
