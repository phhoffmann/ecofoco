import { create } from 'zustand'
import { addCollectedEntry, deleteCollectedEntry, listCollectedEntries } from '../data/collectionRepo'
import { describeCatch } from '../domain/catch'
import { speciesById, type Species } from '../domain/species'
import type { CollectedEntry } from '../domain/types'
import { activeBiome } from './biomeStore'
import { useCelebrationStore } from './celebrationStore'

interface CollectionState {
  entries: CollectedEntry[]
  loaded: boolean
  /** The latest catch, highlighted in the Collection until the user has seen it there. */
  highlightSpeciesId: string | null
  refresh: () => Promise<void>
  /** Call after a CollectedEntry was written: refreshes the Collection and reveals the catch. */
  reveal: (species: Species, points: number, undo?: () => Promise<void>) => Promise<void>
  clearHighlight: () => void
  logManualSighting: (speciesId: string) => Promise<void>
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  entries: [],
  loaded: false,
  highlightSpeciesId: null,

  refresh: async () => {
    const entries = await listCollectedEntries()
    set({ entries, loaded: true })
  },

  reveal: async (species, points, undo) => {
    await get().refresh()
    set({ highlightSpeciesId: species.id })
    useCelebrationStore.getState().celebrate(describeCatch(species, get().entries, activeBiome(), points), undo)
  },

  clearHighlight: () => set({ highlightSpeciesId: null }),

  logManualSighting: async (speciesId) => {
    const species = speciesById(speciesId)
    if (!species) return
    const entry = await addCollectedEntry(speciesId, 'manual_sighting')
    await get().reveal(species, 0, async () => {
      await deleteCollectedEntry(entry.id)
      if (get().highlightSpeciesId === speciesId) set({ highlightSpeciesId: null })
      await get().refresh()
    })
  },
}))
