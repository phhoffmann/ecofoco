import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CatchReveal } from '../domain/catch'
import { SPECIES_CATALOG } from '../domain/species'
import { DEFAULT_DISPLAY_PREFERENCES } from '../domain/types'

const { lightHaptic } = vi.hoisted(() => ({ lightHaptic: vi.fn() }))
vi.mock('../data/haptics', () => ({ lightHaptic }))
vi.mock('../data/settingsRepo', () => ({}))

import { useCelebrationStore } from './celebrationStore'
import { useSettingsStore } from './settingsStore'

const reveal: CatchReveal = {
  species: SPECIES_CATALOG.find((s) => s.id === 'quaresmeira')!,
  biome: 'atlantic-forest',
  isNew: true,
  timesCollected: 1,
  dexCollected: 1,
  dexTotal: 80,
  points: 10,
}

describe('celebrationStore', () => {
  beforeEach(() => {
    lightHaptic.mockClear()
    useSettingsStore.setState({ display: DEFAULT_DISPLAY_PREFERENCES })
    useCelebrationStore.setState({ reveal: null, seq: 0, snackbar: null, pendingUndo: null })
  })

  it('celebrate() reveals the catch and plays a light haptic', () => {
    useCelebrationStore.getState().celebrate(reveal)

    expect(useCelebrationStore.getState().reveal).toEqual(reveal)
    expect(useCelebrationStore.getState().snackbar).toBeNull()
    expect(lightHaptic).toHaveBeenCalledOnce()
  })

  it('celebrating the same species again bumps seq so the animation replays', () => {
    useCelebrationStore.getState().celebrate(reveal)
    useCelebrationStore.getState().celebrate(reveal)

    expect(useCelebrationStore.getState().seq).toBe(2)
  })

  it('dismiss() clears the reveal', () => {
    useCelebrationStore.getState().celebrate(reveal)
    useCelebrationStore.getState().dismiss()

    expect(useCelebrationStore.getState().reveal).toBeNull()
    expect(useCelebrationStore.getState().snackbar).toBeNull()
  })

  it('offers Undo in a snackbar once the reveal is dismissed', () => {
    const undo = vi.fn().mockResolvedValue(undefined)
    useCelebrationStore.getState().celebrate(reveal, undo)
    expect(useCelebrationStore.getState().snackbar).toBeNull()

    useCelebrationStore.getState().dismiss()

    expect(useCelebrationStore.getState().snackbar).toMatchObject({ reveal, undo })
  })

  it('shows a snackbar instead of the reveal when celebrations are off', () => {
    useSettingsStore.setState({ display: { ...DEFAULT_DISPLAY_PREFERENCES, celebrations: false } })

    useCelebrationStore.getState().celebrate(reveal)

    expect(useCelebrationStore.getState().reveal).toBeNull()
    expect(useCelebrationStore.getState().snackbar).toMatchObject({ reveal, undo: null })
  })

  it('stays silent when haptics are off', () => {
    useSettingsStore.setState({ display: { ...DEFAULT_DISPLAY_PREFERENCES, haptics: false } })

    useCelebrationStore.getState().celebrate(reveal)

    expect(lightHaptic).not.toHaveBeenCalled()
  })
})
