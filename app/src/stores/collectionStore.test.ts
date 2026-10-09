import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CollectedEntry } from '../domain/types'

const { listCollectedEntries, addCollectedEntry, deleteCollectedEntry } = vi.hoisted(() => ({
  listCollectedEntries: vi.fn(),
  addCollectedEntry: vi.fn(),
  deleteCollectedEntry: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../data/collectionRepo', () => ({ listCollectedEntries, addCollectedEntry, deleteCollectedEntry }))
vi.mock('../data/haptics', () => ({ lightHaptic: vi.fn() }))
vi.mock('../data/settingsRepo', () => ({}))
vi.mock('./biomeStore', () => ({ activeBiome: () => 'atlantic-forest' }))

import { useCelebrationStore } from './celebrationStore'
import { useCollectionStore } from './collectionStore'

const sighting: CollectedEntry = {
  id: 'entry-1',
  speciesId: 'quaresmeira',
  collectedAt: '2026-09-10T00:00:00.000Z',
  method: 'manual_sighting',
}

describe('collectionStore', () => {
  beforeEach(() => {
    listCollectedEntries.mockReset()
    addCollectedEntry.mockReset().mockResolvedValue(sighting)
    deleteCollectedEntry.mockClear()
    useCollectionStore.setState({ entries: [], loaded: false, highlightSpeciesId: null })
    useCelebrationStore.setState({ reveal: null, snackbar: null, pendingUndo: null })
  })

  it('refresh() loads entries from the repository and marks the store as loaded', async () => {
    const entries = [{ id: '1', speciesId: 'jatoba', collectedAt: '2026-09-10T00:00:00.000Z', method: 'draw' }]
    listCollectedEntries.mockResolvedValue(entries)

    await useCollectionStore.getState().refresh()

    expect(useCollectionStore.getState()).toMatchObject({ entries, loaded: true })
  })

  it('logManualSighting() adds the entry, refreshes the collection and highlights the species', async () => {
    listCollectedEntries.mockResolvedValue([sighting])

    await useCollectionStore.getState().logManualSighting('quaresmeira')

    expect(addCollectedEntry).toHaveBeenCalledWith('quaresmeira', 'manual_sighting')
    expect(useCollectionStore.getState()).toMatchObject({ entries: [sighting], loaded: true, highlightSpeciesId: 'quaresmeira' })
  })

  it('logManualSighting() reveals the catch as new, with no points', async () => {
    listCollectedEntries.mockResolvedValue([sighting])

    await useCollectionStore.getState().logManualSighting('quaresmeira')

    expect(useCelebrationStore.getState().reveal).toMatchObject({
      species: { id: 'quaresmeira' },
      isNew: true,
      timesCollected: 1,
      points: 0,
    })
  })

  it('logManualSighting() can be undone, removing only that entry', async () => {
    listCollectedEntries.mockResolvedValue([sighting])
    await useCollectionStore.getState().logManualSighting('quaresmeira')
    useCelebrationStore.getState().dismiss()

    listCollectedEntries.mockResolvedValue([])
    await useCelebrationStore.getState().snackbar!.undo!()

    expect(deleteCollectedEntry).toHaveBeenCalledWith('entry-1')
    expect(useCollectionStore.getState()).toMatchObject({ entries: [], highlightSpeciesId: null })
  })

  it('logManualSighting() ignores an id missing from the catalog', async () => {
    await useCollectionStore.getState().logManualSighting('not-a-species')

    expect(addCollectedEntry).not.toHaveBeenCalled()
    expect(useCelebrationStore.getState().reveal).toBeNull()
  })
})
