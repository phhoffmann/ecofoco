import { create } from 'zustand'
import { addCollectedEntry, listCollectedEntries } from '../data/collectionRepo'
import type { CollectedEntry } from '../domain/types'

interface CollectionState {
  entries: CollectedEntry[]
  loaded: boolean
  refresh: () => Promise<void>
  logManualSighting: (speciesId: string) => Promise<void>
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  entries: [],
  loaded: false,
  refresh: async () => {
    const entries = await listCollectedEntries()
    set({ entries, loaded: true })
  },
  logManualSighting: async (speciesId) => {
    await addCollectedEntry(speciesId, 'manual_sighting')
    await get().refresh()
  },
}))
