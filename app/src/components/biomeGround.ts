import type { BiomeId } from '../domain/biome'

/** Texture drawn over a tile: short grass blades, pebbles/dust specks, or water ripples. */
export type GroundTexture = 'blades' | 'specks' | 'ripples'

/**
 * Ground look for the isometric plot, one per Biome. Colour pairs are [lit, shaded]. A few tiles (picked by
 * stable noise) use the accent instead: water in the Pantanal, cracked earth in the Caatinga, and so on.
 */
export interface GroundPalette {
  tile: [string, string]
  lip: [string, string]
  soil: [string, string]
  texture: GroundTexture
  /** Texture marks: [highlight, shadow]. */
  marks: [string, string]
  accent: { fill: string; texture: GroundTexture; marks: string; density: number; water: boolean }
  /** Drifting ambient particles: pollen, dust, fireflies. */
  particles: { color: string; glow: boolean }
}

export const BIOME_GROUND: Record<BiomeId, GroundPalette> = {
  'atlantic-forest': {
    tile: ['#5fbf7f', '#55b375'],
    lip: ['#3f9a5e', '#33834f'],
    soil: ['#7a4b2e', '#5f3a23'],
    texture: 'blades',
    marks: ['#86d79b', '#3f9a5e'],
    accent: { fill: '#4aa56a', texture: 'blades', marks: '#2f7f4b', density: 0.14, water: false },
    particles: { color: '#fdf6c8', glow: false },
  },
  caatinga: {
    tile: ['#d9be86', '#ccb079'],
    lip: ['#b39657', '#9b7f47'],
    soil: ['#9a5531', '#7a4126'],
    texture: 'specks',
    marks: ['#ecd9a8', '#a78a52'],
    accent: { fill: '#c99f6a', texture: 'specks', marks: '#8f6339', density: 0.16, water: false },
    particles: { color: '#f6d7a8', glow: false },
  },
  amazon: {
    tile: ['#3fa56c', '#379862'],
    lip: ['#2a7f4f', '#226b42'],
    soil: ['#5e3c22', '#4a2f1b'],
    texture: 'blades',
    marks: ['#5cc286', '#24764a'],
    accent: { fill: '#6b7f3a', texture: 'specks', marks: '#4b5a26', density: 0.15, water: false },
    particles: { color: '#e9ff8a', glow: true },
  },
  cerrado: {
    tile: ['#bccb6a', '#afbe5f'],
    lip: ['#8fa246', '#7c8d3b'],
    soil: ['#b0602f', '#8e4c25'],
    texture: 'blades',
    marks: ['#d9e48e', '#8b9c42'],
    accent: { fill: '#c98a54', texture: 'specks', marks: '#9c5f31', density: 0.13, water: false },
    particles: { color: '#fff3d6', glow: false },
  },
  pantanal: {
    tile: ['#78c49c', '#6db890'],
    lip: ['#4c9c74', '#408763'],
    soil: ['#5d4a3a', '#4a3a2e'],
    texture: 'blades',
    marks: ['#9bdbb6', '#4c9c74'],
    accent: { fill: '#4fa3c7', texture: 'ripples', marks: '#bde8f5', density: 0.2, water: true },
    particles: { color: '#d9fbff', glow: true },
  },
  pampa: {
    tile: ['#93d276', '#88c66b'],
    lip: ['#69ad4f', '#5b9844'],
    soil: ['#7a5534', '#63442a'],
    texture: 'blades',
    marks: ['#b8e69d', '#64a54a'],
    accent: { fill: '#a6d98a', texture: 'blades', marks: '#f2f7d0', density: 0.16, water: false },
    particles: { color: '#ffffff', glow: false },
  },
}
