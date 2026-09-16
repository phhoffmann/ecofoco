import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getNotificationsEnabled,
  setNotificationsEnabled,
  getLanguage,
  setLanguage,
  getStepGoal,
  setStepGoal,
  changeLanguage,
} = vi.hoisted(() => ({
  getNotificationsEnabled: vi.fn(),
  setNotificationsEnabled: vi.fn().mockResolvedValue(undefined),
  getLanguage: vi.fn(),
  setLanguage: vi.fn().mockResolvedValue(undefined),
  getStepGoal: vi.fn(),
  setStepGoal: vi.fn().mockResolvedValue(undefined),
  changeLanguage: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../data/settingsRepo', () => ({
  getNotificationsEnabled,
  setNotificationsEnabled,
  getLanguage,
  setLanguage,
  getStepGoal,
  setStepGoal,
}))
vi.mock('i18next', () => ({ default: { changeLanguage } }))

import { useSettingsStore } from './settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    getNotificationsEnabled.mockReset()
    setNotificationsEnabled.mockClear()
    getLanguage.mockReset().mockResolvedValue('en')
    setLanguage.mockClear()
    getStepGoal.mockReset().mockResolvedValue(6000)
    setStepGoal.mockClear()
    changeLanguage.mockClear()
    useSettingsStore.setState({ notificationsEnabled: false, language: 'en', stepGoal: 6000, loaded: false })
  })

  it('load() reads the persisted flag, language, and step goal, and marks the store as loaded', async () => {
    getNotificationsEnabled.mockResolvedValue(true)
    getLanguage.mockResolvedValue('pt-BR')
    getStepGoal.mockResolvedValue(8000)

    await useSettingsStore.getState().load()

    const state = useSettingsStore.getState()
    expect(state.notificationsEnabled).toBe(true)
    expect(state.language).toBe('pt-BR')
    expect(state.stepGoal).toBe(8000)
    expect(state.loaded).toBe(true)
    expect(changeLanguage).toHaveBeenCalledWith('pt-BR')
  })

  it('setNotificationsEnabled() persists and updates the flag', async () => {
    await useSettingsStore.getState().setNotificationsEnabled(true)

    expect(setNotificationsEnabled).toHaveBeenCalledWith(true)
    expect(useSettingsStore.getState().notificationsEnabled).toBe(true)
  })

  it('setLanguage() persists, switches i18next, and updates the store', async () => {
    await useSettingsStore.getState().setLanguage('pt-BR')

    expect(setLanguage).toHaveBeenCalledWith('pt-BR')
    expect(changeLanguage).toHaveBeenCalledWith('pt-BR')
    expect(useSettingsStore.getState().language).toBe('pt-BR')
  })

  it('setStepGoal() persists and updates the configured goal', async () => {
    await useSettingsStore.getState().setStepGoal(8000)

    expect(setStepGoal).toHaveBeenCalledWith(8000)
    expect(useSettingsStore.getState().stepGoal).toBe(8000)
  })
})
