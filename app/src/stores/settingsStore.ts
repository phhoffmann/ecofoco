import i18next from 'i18next'
import { create } from 'zustand'
import {
  getLanguage,
  getNotificationsEnabled,
  getStepGoal,
  setLanguage,
  setNotificationsEnabled,
  setStepGoal,
} from '../data/settingsRepo'
import { DEFAULT_STEP_GOAL } from '../domain/types'
import { DEFAULT_LOCALE, type Locale } from '../i18n/locale'

interface SettingsState {
  notificationsEnabled: boolean
  language: Locale
  stepGoal: number
  loaded: boolean
  load: () => Promise<void>
  setNotificationsEnabled: (enabled: boolean) => Promise<void>
  setLanguage: (language: Locale) => Promise<void>
  setStepGoal: (stepGoal: number) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  notificationsEnabled: false,
  language: DEFAULT_LOCALE,
  stepGoal: DEFAULT_STEP_GOAL,
  loaded: false,

  load: async () => {
    const [notificationsEnabled, language, stepGoal] = await Promise.all([
      getNotificationsEnabled(),
      getLanguage(),
      getStepGoal(),
    ])
    void i18next.changeLanguage(language)
    set({ notificationsEnabled, language, stepGoal, loaded: true })
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
}))
