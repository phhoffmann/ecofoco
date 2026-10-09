import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { DEFAULT_DISPLAY_PREFERENCES } from '../domain/types'
import { useBiomeStore } from '../stores/biomeStore'
import { useSettingsStore } from '../stores/settingsStore'
import { SettingsScreen } from './SettingsScreen'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('../data/settingsRepo', () => ({}))

const setDisplay = vi.fn().mockResolvedValue(undefined)

describe('SettingsScreen', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    setDisplay.mockClear()
    useSettingsStore.setState({
      loaded: true,
      load: vi.fn().mockResolvedValue(undefined),
      language: 'en',
      stepGoal: 12500,
      display: DEFAULT_DISPLAY_PREFERENCES,
      setDisplay,
    })
    useBiomeStore.setState({ load: vi.fn().mockResolvedValue(undefined) })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<SettingsScreen />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('no longer carries the collection view toggle, which lives on the Collection screen', () => {
    expect(container.textContent).toContain('Daily step goal')
    expect(container.textContent).not.toContain('Collection view')
    expect([...container.querySelectorAll('button')].map((b) => b.textContent)).not.toContain('Garden')
  })

  it('no longer shows the Notifications toggle, which did nothing', () => {
    expect(container.textContent).not.toContain('Notifications')
  })

  it('formats the step goal for the language', () => {
    expect(container.textContent).toContain('12,500 steps')
  })

  it('offers Display & feedback toggles that start from sensible defaults', () => {
    const switches = [...container.querySelectorAll<HTMLButtonElement>('[role="switch"]')]
    expect(switches.map((s) => [s.getAttribute('aria-label'), s.getAttribute('aria-checked')])).toEqual([
      ['Celebrations', 'true'],
      ['Haptics', 'true'],
      ['Timer on other tabs', 'true'],
    ])
    const motion = container.querySelector('[role="group"][aria-label="Animations"]')!
    expect(motion.querySelector('[aria-pressed="true"]')?.textContent).toBe('System')

    act(() => switches[0].click())
    expect(setDisplay).toHaveBeenCalledWith('celebrations', false)

    act(() => [...motion.querySelectorAll('button')].find((b) => b.textContent === 'Reduced')!.click())
    expect(setDisplay).toHaveBeenCalledWith('motion', 'reduce')
  })

  it('gives every switch a 44px hit area', () => {
    for (const s of container.querySelectorAll('[role="switch"]')) expect(s.className).toMatch(/\bh-11\b/)
  })
})
