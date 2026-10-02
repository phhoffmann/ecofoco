import i18next from 'i18next'
import { create } from 'zustand'
import {
  getCollectionView,
  getLanguage,
  getNotificationsEnabled,
  getStepGoal,
  setCollectionView,
  setLanguage,
  setNotificationsEnabled,
  setStepGoal,
} from '../data/settingsRepo'
import { DEFAULT_COLLECTION_VIEW, DEFAULT_STEP_GOAL, type CollectionView } from '../domain/types'
import { DEFAULT_LOCALE, type Locale } from '../i18n/locale'

interface SettingsState {
  notificationsEnabled: boolean
  language: Locale
  stepGoal: number
  collectionView: CollectionView
  loaded: boolean
  load: () => Promise<void>
  setNotificationsEnabled: (enabled: boolean) => Promise<void>
  setLanguage: (language: Locale) => Promise<void>
  setStepGoal: (stepGoal: number) => Promise<void>
  setCollectionView: (view: CollectionView) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  notificationsEnabled: false,
  language: DEFAULT_LOCALE,
  stepGoal: DEFAULT_STEP_GOAL,
  collectionView: DEFAULT_COLLECTION_VIEW,
  loaded: false,

  load: async () => {
    const [notificationsEnabled, language, stepGoal, collectionView] = await Promise.all([
      getNotificationsEnabled(),
      getLanguage(),
      getStepGoal(),
      getCollectionView(),
    ])
    void i18next.changeLanguage(language)
    set({ notificationsEnabled, language, stepGoal, collectionView, loaded: true })
  },

  setNotificationsEnabled: async (enabled) => {
    await setNotificationsEnabled(enabled)
    set({ notificationsEnabled: enabled })
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
}))
