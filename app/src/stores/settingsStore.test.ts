import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getDisplayPreferences,
  setDisplayPreference,
  setMotionPreference,
  getLanguage,
  setLanguage,
  getStepGoal,
  setStepGoal,
  getCollectionView,
  setCollectionView,
  changeLanguage,
} = vi.hoisted(() => ({
  getDisplayPreferences: vi.fn(),
  setDisplayPreference: vi.fn().mockResolvedValue(undefined),
  setMotionPreference: vi.fn(),
  getLanguage: vi.fn(),
  setLanguage: vi.fn().mockResolvedValue(undefined),
  getStepGoal: vi.fn(),
  setStepGoal: vi.fn().mockResolvedValue(undefined),
  getCollectionView: vi.fn(),
  setCollectionView: vi.fn().mockResolvedValue(undefined),
  changeLanguage: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../data/motion', () => ({ setMotionPreference }))
vi.mock('../data/settingsRepo', () => ({
  getDisplayPreferences,
  setDisplayPreference,
  getLanguage,
  setLanguage,
  getStepGoal,
  setStepGoal,
  getCollectionView,
  setCollectionView,
}))
vi.mock('i18next', () => ({ default: { changeLanguage } }))

import { DEFAULT_DISPLAY_PREFERENCES } from '../domain/types'
import { useSettingsStore } from './settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    getDisplayPreferences.mockReset().mockResolvedValue(DEFAULT_DISPLAY_PREFERENCES)
    setDisplayPreference.mockClear()
    setMotionPreference.mockClear()
    getLanguage.mockReset().mockResolvedValue('en')
    setLanguage.mockClear()
    getStepGoal.mockReset().mockResolvedValue(6000)
    setStepGoal.mockClear()
    getCollectionView.mockReset().mockResolvedValue('grid')
    setCollectionView.mockClear()
    changeLanguage.mockClear()
    useSettingsStore.setState({
      display: DEFAULT_DISPLAY_PREFERENCES,
      language: 'en',
      stepGoal: 6000,
      collectionView: 'grid',
      loaded: false,
    })
  })

  it('load() reads the persisted language, step goal, collection view and display preferences, and marks the store as loaded', async () => {
    getDisplayPreferences.mockResolvedValue({ ...DEFAULT_DISPLAY_PREFERENCES, motion: 'reduce', haptics: false })
    getLanguage.mockResolvedValue('pt-BR')
    getStepGoal.mockResolvedValue(8000)
    getCollectionView.mockResolvedValue('isometric')

    await useSettingsStore.getState().load()

    const state = useSettingsStore.getState()
    expect(state.display).toEqual({ ...DEFAULT_DISPLAY_PREFERENCES, motion: 'reduce', haptics: false })
    expect(setMotionPreference).toHaveBeenCalledWith('reduce')
    expect(state.language).toBe('pt-BR')
    expect(state.stepGoal).toBe(8000)
    expect(state.collectionView).toBe('isometric')
    expect(state.loaded).toBe(true)
    expect(changeLanguage).toHaveBeenCalledWith('pt-BR')
  })

  it('setDisplay() persists and updates one preference', async () => {
    await useSettingsStore.getState().setDisplay('celebrations', false)

    expect(setDisplayPreference).toHaveBeenCalledWith('celebrations', false)
    expect(useSettingsStore.getState().display).toEqual({ ...DEFAULT_DISPLAY_PREFERENCES, celebrations: false })
    expect(setMotionPreference).not.toHaveBeenCalled()
  })

  it('setDisplay() applies a motion preference straight away', async () => {
    await useSettingsStore.getState().setDisplay('motion', 'full')

    expect(setMotionPreference).toHaveBeenCalledWith('full')
    expect(useSettingsStore.getState().display.motion).toBe('full')
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

  it('setCollectionView() persists and updates the view', async () => {
    await useSettingsStore.getState().setCollectionView('isometric')

    expect(setCollectionView).toHaveBeenCalledWith('isometric')
    expect(useSettingsStore.getState().collectionView).toBe('isometric')
  })
})
