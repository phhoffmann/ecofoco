import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import type { CatchReveal } from '../domain/catch'
import { SPECIES_CATALOG } from '../domain/species'
import { useCelebrationStore } from '../stores/celebrationStore'
import { CatchSnackbar, SNACKBAR_MS } from './CatchSnackbar'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('../data/haptics', () => ({ lightHaptic: vi.fn() }))
vi.mock('../data/settingsRepo', () => ({}))

const reveal: CatchReveal = {
  species: SPECIES_CATALOG.find((s) => s.id === 'quaresmeira')!,
  biome: 'atlantic-forest',
  isNew: false,
  timesCollected: 2,
  dexCollected: 5,
  dexTotal: 80,
  points: 0,
}

describe('CatchSnackbar', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.useFakeTimers()
    useCelebrationStore.setState({ reveal: null, snackbar: null, pendingUndo: null })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<CatchSnackbar />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.useRealTimers()
  })

  const bar = () => container.querySelector<HTMLElement>('[role="status"]')
  const undoButton = () => [...container.querySelectorAll('button')].find((b) => b.textContent === 'Undo')

  it('waits until the reveal is dismissed, then offers Undo', async () => {
    const undo = vi.fn().mockResolvedValue(undefined)
    act(() => useCelebrationStore.getState().celebrate(reveal, undo))
    expect(bar()).toBeNull()

    act(() => useCelebrationStore.getState().dismiss())
    expect(bar()?.textContent).toContain('Glory Bush Tree added · Seen ×2')

    await act(async () => undoButton()!.click())
    expect(undo).toHaveBeenCalledOnce()
    expect(bar()).toBeNull()
  })

  it('has no Undo for catches that cannot be undone, and slips away on its own', () => {
    act(() => useCelebrationStore.setState({ snackbar: { reveal, undo: null, seq: 1 } }))
    expect(undoButton()).toBeUndefined()

    act(() => vi.advanceTimersByTime(SNACKBAR_MS))
    expect(bar()).toBeNull()
  })
})
