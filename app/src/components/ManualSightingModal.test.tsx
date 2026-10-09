import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { SPECIES_CATALOG } from '../domain/species'
import { useCelebrationStore } from '../stores/celebrationStore'
import { useCollectionStore } from '../stores/collectionStore'
import { CelebrationOverlay } from './CelebrationOverlay'
import { ManualSightingModal } from './ManualSightingModal'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('../data/collectionRepo', () => ({}))
vi.mock('../data/haptics', () => ({ lightHaptic: vi.fn() }))
vi.mock('@capacitor/app', () => ({
  App: { addListener: () => Promise.resolve({ remove: vi.fn() }) },
}))

describe('ManualSightingModal', () => {
  let container: HTMLDivElement
  let root: Root
  const logManualSighting = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    logManualSighting.mockReset().mockResolvedValue(undefined)
    onClose.mockClear()
    useCollectionStore.setState({
      logManualSighting,
      entries: [
        { id: '1', speciesId: 'quaresmeira', collectedAt: '2026-09-10T10:00:00.000Z', method: 'focus_session' },
        { id: '2', speciesId: 'quaresmeira', collectedAt: '2026-09-11T10:00:00.000Z', method: 'focus_session' },
      ],
    })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<ManualSightingModal onClose={onClose} />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.useRealTimers()
  })

  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')!
  const rows = () => [...dialog().querySelectorAll('li button')]
  const button = (label: string) => [...dialog().querySelectorAll('button')].find((b) => b.textContent === label)!
  function search(text: string) {
    const input = dialog().querySelector<HTMLInputElement>('input[type="search"]')!
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  it('narrows the list by name, ignoring case and accents', () => {
    const all = rows().length
    search('GLORY')

    expect(rows().length).toBeLessThan(all)
    expect(rows().map((r) => r.textContent)).toEqual([expect.stringContaining('Glory Bush Tree')])
  })

  it('says so when nothing matches', () => {
    search('zzzz')
    expect(rows()).toHaveLength(0)
    expect(dialog().textContent).toContain('No species match “zzzz”.')
  })

  it('marks species already in the collection', () => {
    search('glory')
    expect(rows()[0].textContent).toContain('Collected ×2')
  })

  it('asks for confirmation before logging, and can go back', async () => {
    search('glory')
    act(() => (rows()[0] as HTMLButtonElement).click())

    expect(dialog().textContent).toContain('Log this sighting?')
    expect(logManualSighting).not.toHaveBeenCalled()

    act(() => button('Back').click())
    expect(dialog().querySelector('input[type="search"]')).not.toBeNull()

    act(() => (rows()[0] as HTMLButtonElement).click())
    await act(async () => button('Log sighting').click())
    expect(logManualSighting).toHaveBeenCalledExactlyOnceWith('quaresmeira')
  })

  it('leaves focus in the catch reveal once the sheet has closed behind it, so Escape still dismisses it', async () => {
    act(() => root.unmount())
    useCelebrationStore.setState({ reveal: null, seq: 0, snackbar: null, pendingUndo: null })
    logManualSighting.mockImplementation(async () =>
      useCelebrationStore.getState().celebrate({
        species: SPECIES_CATALOG.find((s) => s.id === 'quaresmeira')!,
        biome: 'atlantic-forest',
        isNew: false,
        timesCollected: 3,
        dexCollected: 12,
        dexTotal: 80,
        points: 0,
      }),
    )
    const opener = document.createElement('button')
    container.before(opener)
    opener.focus()
    root = createRoot(container)
    const render = (sheetOpen: boolean) =>
      act(() =>
        root.render(
          <>
            {sheetOpen && <ManualSightingModal onClose={onClose} />}
            <CelebrationOverlay />
          </>,
        ),
      )
    render(true)

    search('glory')
    act(() => (rows()[0] as HTMLButtonElement).click())
    await act(async () => button('Log sighting').click())
    act(() => vi.advanceTimersByTime(200))
    expect(onClose).toHaveBeenCalledOnce()
    render(false)

    const reveal = container.querySelector<HTMLElement>('[role="dialog"]')!
    expect(reveal.contains(document.activeElement)).toBe(true)

    act(() => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(useCelebrationStore.getState().reveal).toBeNull()
    opener.remove()
  })
})
