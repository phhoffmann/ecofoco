import { create } from 'zustand'

export const TAB_IDS = ['focus', 'activity', 'collection', 'settings'] as const
export type Tab = (typeof TAB_IDS)[number]

interface NavigationState {
  tab: Tab
  setTab: (tab: Tab) => void
}

/** The bottom-nav tab, in a store so the timer pill and the catch reveal can switch tabs too. */
export const useNavigationStore = create<NavigationState>((set) => ({
  tab: 'focus',
  setTab: (tab) => set({ tab }),
}))
