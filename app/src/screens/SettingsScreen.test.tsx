import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import { useSettingsStore } from '../stores/settingsStore'
import { SettingsScreen } from './SettingsScreen'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('../data/settingsRepo', () => ({}))

describe('SettingsScreen', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    useSettingsStore.setState({ loaded: true, load: vi.fn().mockResolvedValue(undefined) })
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
})
