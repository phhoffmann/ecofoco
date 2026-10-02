import { create } from 'zustand'
import { addCollectedEntry, listCollectedEntries } from '../data/collectionRepo'
import { SPECIES_CATALOG } from '../domain/species'
import type { CollectedEntry } from '../domain/types'
import { useCelebrationStore } from './celebrationStore'

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
    const species = SPECIES_CATALOG.find((s) => s.id === speciesId)
    if (species) useCelebrationStore.getState().celebrate(species)
    await get().refresh()
  },
}))
