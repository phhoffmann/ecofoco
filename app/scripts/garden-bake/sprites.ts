// What scripts/bake-garden-sprites.ts renders: one sprite per Archetype (plus growth stages and ground
// decoration), all from CC0 Kenney kits or the hand-built models in procedural.js.

/** The JSON bake.html reads from its `job` query parameter. */
export interface SpriteJob {
  /** Model path, relative to the kit cache. */
  model?: string
  procedural?: { kind: 'lizard' | 'seedling'; colors: Record<string, string> }
  /** Material name → colour, to give every kit one shared palette. */
  recolor?: Record<string, string>
  yaw?: number
  scale?: number
  animation?: { clip: string; time: number }
  /** Centre the footprint on the origin (for models whose pivot is at a corner). */
  center?: boolean
}

export interface SpriteSpec {
  /** Output name: src/assets/garden/<name>.webp */
  name: string
  job: SpriteJob
}

export interface Kit {
  id: string
  url: string
}

export const KITS: Kit[] = [
  { id: 'nature', url: 'https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip' },
  { id: 'pets', url: 'https://kenney.nl/media/pages/assets/cube-pets/44e58e945f-1774520254/kenney_cube-pets_1.0.zip' },
]

const nature = (file: string) => `nature/Models/GLTF format/${file}.glb`
const pet = (file: string) => `pets/Models/GLB format/animal-${file}.glb`

// One palette for every plant, replacing the kit's mint default.
const BARK = '#7a4b2e'
const LEAF = '#4f9d3a'
const LEAF_DEEP = '#2f7a3a'
const LEAF_LIGHT = '#7cbf3f'
const BLOSSOM = '#d36fc4'
const PALM = '#5ea83c'

// Kit trees are about half a tile across; plants are scaled up so a grown tree fills most of its tile.
const PLANT_SCALE = 1.5

const plant = (file: string, leaf: string, extra: Partial<SpriteJob> = {}): SpriteJob => ({
  model: nature(file),
  scale: PLANT_SCALE,
  recolor: { woodBark: BARK, leafsGreen: leaf, grass: leaf, leafsFall: leaf, leafsDark: leaf },
  center: true,
  ...extra,
})

const animal = (file: string, extra: Partial<SpriteJob> = {}): SpriteJob => ({
  model: pet(file),
  yaw: 20,
  scale: 0.42,
  animation: { clip: 'static', time: 0 },
  center: true,
  ...extra,
})

export const SPRITES: SpriteSpec[] = [
  // Plant archetypes (the fully grown stage).
  { name: 'flowering-tree', job: plant('tree_default', BLOSSOM) },
  { name: 'broadleaf-tree', job: plant('tree_oak', LEAF_DEEP) },
  { name: 'emergent-tree', job: plant('tree_plateau', LEAF_DEEP, { scale: PLANT_SCALE * 1.25 }) },
  { name: 'pioneer-tree', job: plant('tree_thin', LEAF_LIGHT) },
  { name: 'palm', job: plant('tree_palmDetailedTall', PALM) },
  { name: 'shrub', job: plant('plant_bushDetailed', LEAF, { scale: PLANT_SCALE * 1.2 }) },

  // Growth stages every plant passes through before it takes its archetype's shape.
  {
    name: 'stage-seedling',
    job: {
      procedural: { kind: 'seedling', colors: { soil: '#7a4b2e', stem: '#5f9e3a', leaf: LEAF_LIGHT } },
      yaw: 30,
      scale: 1.2,
      center: true,
    },
  },
  { name: 'stage-sapling', job: plant('crops_leafsStageA', LEAF_LIGHT, { scale: 1.2 }) },

  // Animal archetypes.
  { name: 'primate', job: animal('monkey') },
  { name: 'songbird', job: animal('chick', { scale: 0.34 }) },
  { name: 'large-bird', job: animal('parrot') },
  { name: 'small-mammal', job: animal('bunny', { scale: 0.36 }) },
  { name: 'mid-mammal', job: animal('fox') },
  {
    name: 'reptile',
    job: {
      procedural: { kind: 'lizard', colors: { body: '#5d8f3a', belly: '#c9d98a', accent: '#2f4f22' } },
      yaw: -20,
      scale: 1.15,
      center: true,
    },
  },
  { name: 'insect', job: animal('bee', { scale: 0.3 }) },

  // Ground decoration, picked per Biome in src/components/gardenSprites.ts.
  { name: 'decor-grass', job: plant('grass_large', LEAF_LIGHT, { scale: 1 }) },
  { name: 'decor-flowers', job: plant('flower_redC', LEAF, { scale: 1, recolor: { grass: LEAF, colorRed: '#f2b33d', colorWhite: '#fff6dc' } }) },
  { name: 'decor-rock', job: { model: nature('stone_smallA'), recolor: { stone: '#a89a8a' }, center: true } },
  { name: 'decor-cactus', job: plant('cactus_short', '#6f9e4a', { scale: 1 }) },
  { name: 'decor-mushroom', job: { model: nature('mushroom_redGroup'), recolor: { colorRed: '#d9573f', _defaultMat: '#f3e9d6' }, center: true } },
  { name: 'decor-lily', job: { model: nature('lily_small'), recolor: { leafsGreen: '#4f9d3a', leafsDark: '#2f7a3a' }, center: true } },
]
