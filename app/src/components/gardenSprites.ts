import manifest from '../assets/garden/sprites.json'
import type { BiomeId } from '../domain/biome'
import type { Archetype } from '../domain/species'

/** Idle motion of a garden sprite; each maps to a CSS animation in index.css. */
export type SpriteMotion = 'sway' | 'rustle' | 'bob' | 'hop' | 'hover' | 'breathe' | 'none'

export interface GardenSprite {
  src: string
  /** Rendered width as a fraction of one tile's width. */
  width: number
  /** Height over width. */
  aspect: number
  /** Where the sprite touches the ground, as fractions of its box from the top-left. */
  footX: number
  footY: number
  motion: SpriteMotion
}

/** CSS transform-origin at the sprite's foot, so it sways and grows from the ground. */
export function footOrigin(sprite: Pick<GardenSprite, 'footX' | 'footY'>): string {
  return `${sprite.footX * 100}% ${sprite.footY * 100}%`
}

/** CSS translate that puts the sprite's foot on the element's anchor point. */
export function footTranslate(sprite: Pick<GardenSprite, 'footX' | 'footY'>): string {
  return `${-sprite.footX * 100}% ${-sprite.footY * 100}%`
}

type SpriteName = keyof typeof manifest.sprites

const URLS = import.meta.glob<string>('../assets/garden/*.webp', { eager: true, query: '?url', import: 'default' })

// Baked by scripts/bake-garden-sprites.ts (see src/assets/garden/LICENSE.md); all share one pixel scale.
function sprite(name: SpriteName, motion: SpriteMotion): GardenSprite {
  const { width, height, footX, footY } = manifest.sprites[name]
  return {
    src: URLS[`../assets/garden/${name}.webp`],
    width: width / manifest.tilePx,
    aspect: height / width,
    footX: footX / width,
    footY: footY / height,
    motion,
  }
}

export const ARCHETYPE_SPRITES: Record<Archetype, GardenSprite> = {
  'flowering-tree': sprite('flowering-tree', 'sway'),
  'broadleaf-tree': sprite('broadleaf-tree', 'sway'),
  'emergent-tree': sprite('emergent-tree', 'sway'),
  'pioneer-tree': sprite('pioneer-tree', 'sway'),
  palm: sprite('palm', 'sway'),
  shrub: sprite('shrub', 'rustle'),
  primate: sprite('primate', 'bob'),
  songbird: sprite('songbird', 'hop'),
  'large-bird': sprite('large-bird', 'hop'),
  'small-mammal': sprite('small-mammal', 'hop'),
  'mid-mammal': sprite('mid-mammal', 'bob'),
  reptile: sprite('reptile', 'breathe'),
  insect: sprite('insect', 'hover'),
}

/** Shared early growth stages, before a plant takes its archetype's shape. */
export const GROWTH_STAGE_SPRITES = {
  seedling: sprite('stage-seedling', 'rustle'),
  sapling: sprite('stage-sapling', 'rustle'),
}

const grass = sprite('decor-grass', 'none')
const flowers = sprite('decor-flowers', 'none')
const rock = sprite('decor-rock', 'none')
const cactus = sprite('decor-cactus', 'none')
const mushroom = sprite('decor-mushroom', 'none')
const lily = sprite('decor-lily', 'none')

/** Ground decoration scattered on empty tiles, per Biome. Pantanal lilies only go on water tiles. */
export const BIOME_DECOR: Record<BiomeId, { land: GardenSprite[]; water: GardenSprite[] }> = {
  amazon: { land: [grass, mushroom, grass], water: [] },
  'atlantic-forest': { land: [grass, flowers, mushroom], water: [] },
  caatinga: { land: [rock, cactus, rock], water: [] },
  cerrado: { land: [grass, flowers, rock], water: [] },
  pantanal: { land: [grass, flowers], water: [lily] },
  pampa: { land: [grass, flowers, flowers], water: [] },
}
