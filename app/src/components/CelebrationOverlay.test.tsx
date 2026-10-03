import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { SPECIES_CATALOG } from '../domain/species'
import { useCelebrationStore } from '../stores/celebrationStore'
import { CELEBRATION_MS, CelebrationOverlay } from './CelebrationOverlay'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('../data/haptics', () => ({ lightHaptic: vi.fn() }))

const species = SPECIES_CATALOG.find((s) => s.id === 'quaresmeira')!

describe('CelebrationOverlay', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.useFakeTimers()
    useCelebrationStore.setState({ species: null, seq: 0 })
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

  const overlay = () => container.querySelector<HTMLElement>('[role="status"]')

  it('renders nothing until something is collected', () => {
    expect(overlay()).toBeNull()
  })

  it('reveals the new species with its rarity', () => {
    act(() => useCelebrationStore.getState().celebrate(species))

    expect(overlay()).not.toBeNull()
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('Glory Bush Tree')
    expect(overlay()?.textContent).toContain({ common: 'Common', rare: 'Rare', epic: 'Epic' }[species.rarity])
  })

  it('dismisses on tap', () => {
    act(() => useCelebrationStore.getState().celebrate(species))
    act(() => overlay()!.click())

    expect(overlay()).toBeNull()
    expect(useCelebrationStore.getState().species).toBeNull()
  })

  it('dismisses itself within 2 seconds', () => {
    expect(CELEBRATION_MS).toBeLessThanOrEqual(2000)
    act(() => useCelebrationStore.getState().celebrate(species))

    act(() => vi.advanceTimersByTime(CELEBRATION_MS - 1))
    expect(overlay()).not.toBeNull()
    act(() => vi.advanceTimersByTime(1))
    expect(overlay()).toBeNull()
  })
})
