import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './i18n'
import App from './App'
import { DEFAULT_DISPLAY_PREFERENCES } from './domain/types'
import { useBiomeStore } from './stores/biomeStore'
import { useFocusSessionStore } from './stores/focusSessionStore'
import { useNavigationStore } from './stores/navigationStore'
import { useSettingsStore } from './stores/settingsStore'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('./data/appLifecycle', () => ({
  onAppStateChange: () => () => {},
  canTellScreenOffFromAppSwitch: () => true,
  timeInOtherAppsMs: async () => 0,
}))
vi.mock('./data/collectionRepo', () => ({ listCollectedEntries: vi.fn().mockResolvedValue([]) }))
vi.mock('./data/focusSessionRepo', () => ({}))
vi.mock('./data/settingsRepo', () => ({}))
// The Settings screen reads the real database; these tests only check that the shell navigates there.
vi.mock('./screens/SettingsScreen', () => ({ SettingsScreen: () => <div data-testid="settings" /> }))
vi.mock('@capacitor/app', () => ({
  App: { addListener: () => Promise.resolve({ remove: vi.fn() }) },
}))

describe('App while a focus session runs', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    useSettingsStore.setState({ load: vi.fn().mockResolvedValue(undefined), loaded: true, display: DEFAULT_DISPLAY_PREFERENCES })
    useBiomeStore.setState({ load: vi.fn().mockResolvedValue(undefined), loaded: true, homeBiome: 'atlantic-forest', earned: 120, spent: 100 })
    useFocusSessionStore.setState({
      recover: vi.fn().mockResolvedValue(undefined),
      status: 'running',
      plannedDurationSeconds: 1500,
      remainingSeconds: 754,
      growingArchetype: 'palm',
    })
    useNavigationStore.setState({ tab: 'focus' })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => root.render(<App />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const navButton = (label: string) => [...container.querySelectorAll<HTMLButtonElement>('nav button')].find((b) => b.textContent === label)!
  const pill = () => container.querySelector<HTMLButtonElement>('button[aria-label^="Focus session running"]')

  it('recovers a session the process was killed during on launch', () => {
    expect(useFocusSessionStore.getState().recover).toHaveBeenCalledOnce()
  })

  it('keeps the menu and shows no pill on the Focus tab itself', () => {
    expect(container.querySelector('nav')).not.toBeNull()
    expect(pill()).toBeNull()
  })

  it('shows a timer pill on every other tab, and tapping it returns to Focus', async () => {
    await act(async () => navButton('Collection').click())

    expect(pill()?.textContent).toContain('12:34')
    expect(pill()?.getAttribute('aria-label')).toBe('Focus session running, 12:34 left. Go to Focus.')

    await act(async () => pill()!.click())
    expect(useNavigationStore.getState().tab).toBe('focus')
    expect(container.querySelector('[role="timer"]')?.textContent).toBe('12:34')
  })

  it('shows the pill under the header, apart from the bottom nav', async () => {
    await act(async () => navButton('Collection').click())

    expect(container.querySelector('nav')?.contains(pill())).toBe(false)
    expect(container.querySelector('header')?.nextElementSibling?.contains(pill())).toBe(true)
  })

  it('hides the pill when the user turned it off', async () => {
    useSettingsStore.setState({ display: { ...DEFAULT_DISPLAY_PREFERENCES, timerPill: false } })
    await act(async () => navButton('Collection').click())

    expect(pill()).toBeNull()
  })
})

describe('App header points', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    useSettingsStore.setState({ load: vi.fn().mockResolvedValue(undefined), loaded: true, display: DEFAULT_DISPLAY_PREFERENCES })
    useBiomeStore.setState({ load: vi.fn().mockResolvedValue(undefined), loaded: true, homeBiome: 'atlantic-forest', earned: 120, spent: 100 })
    useFocusSessionStore.setState({ recover: vi.fn().mockResolvedValue(undefined), status: 'idle' })
    useNavigationStore.setState({ tab: 'focus' })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => root.render(<App />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const chip = () => container.querySelector<HTMLButtonElement>('header button[aria-label$="points"]')
  const number = () => chip()!.querySelector('[aria-hidden]:not(svg)')!

  it('shows the balance next to the biome badge, labelled for screen readers', () => {
    expect(chip()?.getAttribute('aria-label')).toBe('20 points')
    expect(chip()?.textContent).toBe('20')
    expect(container.querySelector('header')?.textContent).toContain('Atlantic Forest')
  })

  it('animates the number only when the balance changes', async () => {
    expect(number().classList.contains('points-bump')).toBe(false)

    await act(async () => useBiomeStore.setState({ earned: 130 }))

    expect(chip()?.getAttribute('aria-label')).toBe('30 points')
    expect(number().classList.contains('points-bump')).toBe(true)
  })

  it('opens the biome unlocks in Settings when tapped', async () => {
    await act(async () => chip()!.click())

    expect(useNavigationStore.getState().tab).toBe('settings')
  })
})
