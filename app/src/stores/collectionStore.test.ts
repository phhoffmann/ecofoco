import { beforeEach, describe, expect, it, vi } from 'vitest'

const { listCollectedEntries, addCollectedEntry } = vi.hoisted(() => ({
  listCollectedEntries: vi.fn(),
  addCollectedEntry: vi.fn().mockResolvedValue({ id: 'entry-1' }),
}))
vi.mock('../data/collectionRepo', () => ({ listCollectedEntries, addCollectedEntry }))

import { useCollectionStore } from './collectionStore'

describe('collectionStore', () => {
  beforeEach(() => {
    listCollectedEntries.mockReset()
    addCollectedEntry.mockClear()
    useCollectionStore.setState({ entries: [], loaded: false })
  })

  it('refresh() loads entries from the repository and marks the store as loaded', async () => {
    const entries = [{ id: '1', speciesId: 'jatoba', collectedAt: '2026-09-10T00:00:00.000Z', method: 'draw' }]
    listCollectedEntries.mockResolvedValue(entries)

    await useCollectionStore.getState().refresh()

    expect(useCollectionStore.getState()).toEqual({
      entries,
      loaded: true,
      refresh: expect.any(Function),
      logManualSighting: expect.any(Function),
    })
  })

  it('logManualSighting() adds the entry via the repository and refreshes the collection', async () => {
    const entries = [{ id: '2', speciesId: 'jatoba', collectedAt: '2026-09-10T00:00:00.000Z', method: 'manual_sighting' }]
    listCollectedEntries.mockResolvedValue(entries)

    await useCollectionStore.getState().logManualSighting('jatoba')

    expect(addCollectedEntry).toHaveBeenCalledWith('jatoba', 'manual_sighting')
    expect(useCollectionStore.getState().entries).toEqual(entries)
    expect(useCollectionStore.getState().loaded).toBe(true)
  })
})
