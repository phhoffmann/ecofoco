import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18next } from '../i18n'
import { useBiomeStore, type DetectResult } from '../stores/biomeStore'
import { BiomeSettings } from './BiomeSettings'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('BiomeSettings re-detect', () => {
  let container: HTMLDivElement
  let root: Root
  const setHome = vi.fn().mockResolvedValue(undefined)

  beforeEach(async () => {
    await i18next.changeLanguage('en')
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    setHome.mockClear()
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  async function redetectWith(result: DetectResult) {
    useBiomeStore.setState({
      homeBiome: 'atlantic-forest',
      currentBiome: 'atlantic-forest',
      purchased: [],
      earned: 0,
      spent: 0,
      loaded: true,
      load: vi.fn().mockResolvedValue(undefined),
      detectHome: vi.fn().mockResolvedValue(result),
      setHome,
    })
    act(() => root.render(<BiomeSettings />))
    const redetect = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Re-detect from location')!
    await act(async () => redetect.click())
  }

  const pickerButton = (biome: string) => [...container.querySelectorAll('button')].find((b) => b.textContent === biome)

  it('keeps the home and offers no picker when location is unavailable', async () => {
    await redetectWith({ outcome: 'unavailable' })

    expect(container.textContent).toContain("Couldn't get your location. Your home biome is unchanged.")
    expect(pickerButton('Caatinga')).toBeUndefined()
  })

  it.each<DetectResult>([{ outcome: 'unsupported' }, { outcome: 'coming-soon', biome: 'cerrado' }])(
    'offers the picker for $outcome',
    async (result) => {
      await redetectWith(result)

      const caatinga = pickerButton('Caatinga')!
      expect(caatinga).toBeDefined()
      act(() => caatinga.click())
      expect(setHome).toHaveBeenCalledWith('caatinga')
    },
  )
})
