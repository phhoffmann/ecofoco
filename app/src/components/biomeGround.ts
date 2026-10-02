import type { BiomeId } from '../domain/biome'

/** Placeholder ground colors for the isometric plot, one palette per Biome. Pairs are [lit, shaded]. */
export interface GroundPalette {
  tile: [string, string]
  lip: [string, string]
  soil: [string, string]
}

export const BIOME_GROUND: Record<BiomeId, GroundPalette> = {
  'atlantic-forest': { tile: ['#66d39e', '#5cc995'], lip: ['#3fae80', '#34996f'], soil: ['#8b5a2b', '#6e4421'] },
  caatinga: { tile: ['#d8c48c', '#ccb67c'], lip: ['#b09a5e', '#9a854f'], soil: ['#a0522d', '#7f4024'] },
  amazon: { tile: ['#3fb47c', '#37a670'], lip: ['#25875c', '#1d734e'], soil: ['#6b4423', '#55361b'] },
  cerrado: { tile: ['#bdd26c', '#b0c560'], lip: ['#8fa846', '#7c933b'], soil: ['#b5652e', '#935024'] },
  pantanal: { tile: ['#7fcfb6', '#73c2a9'], lip: ['#4fa48b', '#438e78'], soil: ['#5d4a3a', '#4a3a2e'] },
  pampa: { tile: ['#9bd87c', '#90cc71'], lip: ['#6db353', '#5f9e48'], soil: ['#7a5534', '#63442a'] },
}
