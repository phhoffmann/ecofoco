import { create } from 'zustand'
import { lightHaptic } from '../data/haptics'
import type { Species } from '../domain/species'

interface CelebrationState {
  /** The species just added to the Collection, while its celebration is on screen. */
  species: Species | null
  /** Bumped on every celebration so collecting the same species twice still replays it. */
  seq: number
  celebrate: (species: Species) => void
  dismiss: () => void
}

export const useCelebrationStore = create<CelebrationState>((set) => ({
  species: null,
  seq: 0,
  celebrate: (species) => {
    set((s) => ({ species, seq: s.seq + 1 }))
    void lightHaptic()
  },
  dismiss: () => set({ species: null }),
}))
