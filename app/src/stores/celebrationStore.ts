import { create } from 'zustand'
import { lightHaptic } from '../data/haptics'
import type { CatchReveal } from '../domain/catch'
import { useSettingsStore } from './settingsStore'

/** The small, non-blocking note about a catch: instead of the reveal, or after it to offer Undo. */
export interface CatchSnackbar {
  reveal: CatchReveal
  undo: (() => Promise<void>) | null
  /** Bumped per snackbar so an identical one still restarts its timer. */
  seq: number
}

interface CelebrationState {
  /** The catch being revealed; stays until the user taps through it. */
  reveal: CatchReveal | null
  /** Bumped on every celebration so collecting the same species twice still replays it. */
  seq: number
  snackbar: CatchSnackbar | null
  pendingUndo: (() => Promise<void>) | null
  /** One reveal per catch. `undo` is offered in a snackbar once the reveal is dismissed. */
  celebrate: (reveal: CatchReveal, undo?: () => Promise<void>) => void
  dismiss: () => void
  dismissSnackbar: () => void
}

export const useCelebrationStore = create<CelebrationState>((set, get) => ({
  reveal: null,
  seq: 0,
  snackbar: null,
  pendingUndo: null,

  celebrate: (reveal, undo) => {
    const { celebrations, haptics } = useSettingsStore.getState().display
    if (haptics) void lightHaptic()
    const seq = get().seq + 1
    if (celebrations) set({ reveal, seq, pendingUndo: undo ?? null, snackbar: null })
    else set({ seq, snackbar: { reveal, undo: undo ?? null, seq } })
  },

  dismiss: () => {
    const { reveal, pendingUndo, seq } = get()
    set({
      reveal: null,
      pendingUndo: null,
      snackbar: reveal && pendingUndo ? { reveal, undo: pendingUndo, seq } : get().snackbar,
    })
  },

  dismissSnackbar: () => set({ snackbar: null }),
}))
