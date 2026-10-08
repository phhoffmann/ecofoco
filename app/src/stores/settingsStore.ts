import i18next from 'i18next'
import { create } from 'zustand'
import { setMotionPreference } from '../data/motion'
import {
  getCollectionView,
  getDisplayPreferences,
  getLanguage,
  getStepGoal,
  setCollectionView,
  setDisplayPreference,
  setLanguage,
  setStepGoal,
} from '../data/settingsRepo'
import {
  DEFAULT_COLLECTION_VIEW,
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_STEP_GOAL,
  type CollectionView,
  type DisplayPreferences,
} from '../domain/types'
import { DEFAULT_LOCALE, type Locale } from '../i18n/locale'

interface SettingsState {
  language: Locale
  stepGoal: number
  collectionView: CollectionView
  display: DisplayPreferences
  loaded: boolean
  load: () => Promise<void>
  setLanguage: (language: Locale) => Promise<void>
  setStepGoal: (stepGoal: number) => Promise<void>
  setCollectionView: (view: CollectionView) => Promise<void>
  setDisplay: <K extends keyof DisplayPreferences>(preference: K, value: DisplayPreferences[K]) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: DEFAULT_LOCALE,
  stepGoal: DEFAULT_STEP_GOAL,
  collectionView: DEFAULT_COLLECTION_VIEW,
  display: DEFAULT_DISPLAY_PREFERENCES,
  loaded: false,

  load: async () => {
    const [language, stepGoal, collectionView, display] = await Promise.all([
      getLanguage(),
      getStepGoal(),
      getCollectionView(),
      getDisplayPreferences(),
    ])
    void i18next.changeLanguage(language)
    setMotionPreference(display.motion)
    set({ language, stepGoal, collectionView, display, loaded: true })
  },

  setLanguage: async (language) => {
    await setLanguage(language)
    await i18next.changeLanguage(language)
    set({ language })
  },

  setStepGoal: async (stepGoal) => {
    await setStepGoal(stepGoal)
    set({ stepGoal })
  },

  setCollectionView: async (view) => {
    await setCollectionView(view)
    set({ collectionView: view })
  },

  setDisplay: async (preference, value) => {
    if (preference === 'motion') setMotionPreference(value as DisplayPreferences['motion'])
    set((s) => ({ display: { ...s.display, [preference]: value } }))
    await setDisplayPreference(preference, value)
  },
}))
