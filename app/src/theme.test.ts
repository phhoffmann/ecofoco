import { describe, expect, it } from 'vitest'
import css from './index.css?raw'

const SOURCES = import.meta.glob<string>('./**/*.tsx', { query: '?raw', import: 'default', eager: true })

/** The default palette (@theme) plus each Biome's override block. */
function palettes(): Record<string, Record<string, string>> {
  const blocks: Record<string, string> = { default: css.match(/@theme static \{([\s\S]*?)\n\}/)![1] }
  for (const [, biome, body] of css.matchAll(/:root\[data-biome="([a-z-]+)"\] \{([\s\S]*?)\}/g)) blocks[biome] = body
  return Object.fromEntries(
    Object.entries(blocks).map(([name, body]) => [
      name,
      Object.fromEntries([...body.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/g)].map(([, token, hex]) => [token, hex])),
    ]),
  )
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('theme accessibility', () => {
  const all = palettes()

  it('defines every Biome palette', () => {
    expect(Object.keys(all).sort()).toEqual(['amazon', 'caatinga', 'cerrado', 'default', 'pampa', 'pantanal'])
  })

  it.each(Object.keys(all))('%s: ink-faint text has at least 4.5:1 contrast on every surface', (name) => {
    const palette = { ...all.default, ...all[name] }
    for (const surface of ['canvas', 'surface', 'surface-raised', 'surface-sunken']) {
      expect(contrast(palette['ink-faint'], palette[surface]), `ink-faint on ${surface}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('has no text size token under 12px', () => {
    const sizes = [...css.matchAll(/--text-([a-z]+):\s*([\d.]+)rem;/g)]
    expect(sizes.length).toBeGreaterThan(0)
    for (const [, token, rem] of sizes) expect(Number(rem) * 16, token).toBeGreaterThanOrEqual(12)
  })

  it('uses no arbitrary text size under 12px in any component', () => {
    for (const [file, source] of Object.entries(SOURCES)) {
      for (const [, px] of source.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) expect(Number(px), file).toBeGreaterThanOrEqual(12)
      for (const [, rem] of source.matchAll(/text-\[(\d*\.\d+)rem\]/g)) expect(Number(rem) * 16, file).toBeGreaterThanOrEqual(12)
    }
  })
})
