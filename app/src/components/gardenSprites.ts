import broadleafTree from '../assets/garden/broadleaf-tree.png'
import emergentTree from '../assets/garden/emergent-tree.png'
import floweringTree from '../assets/garden/flowering-tree.png'
import grass from '../assets/garden/grass.png'
import insect from '../assets/garden/insect.png'
import largeBird from '../assets/garden/large-bird.png'
import midMammal from '../assets/garden/mid-mammal.png'
import palm from '../assets/garden/palm.png'
import pioneerTree from '../assets/garden/pioneer-tree.png'
import primate from '../assets/garden/primate.png'
import reptile from '../assets/garden/reptile.png'
import shrub from '../assets/garden/shrub.png'
import smallMammal from '../assets/garden/small-mammal.png'
import songbird from '../assets/garden/songbird.png'
import type { Archetype } from '../domain/species'

export type SpriteMotion = 'sway' | 'bob' | 'none'

export interface GardenSprite {
  src: string
  /** Rendered width as a fraction of one tile's width; height follows the image's aspect ratio. */
  width: number
  motion: SpriteMotion
}

// Placeholder CC0 art (see src/assets/garden/LICENSE.md), one sprite per archetype.
export const ARCHETYPE_SPRITES: Record<Archetype, GardenSprite> = {
  'flowering-tree': { src: floweringTree, width: 0.8, motion: 'sway' },
  'broadleaf-tree': { src: broadleafTree, width: 0.75, motion: 'sway' },
  'emergent-tree': { src: emergentTree, width: 0.95, motion: 'sway' },
  'pioneer-tree': { src: pioneerTree, width: 0.65, motion: 'sway' },
  palm: { src: palm, width: 0.95, motion: 'sway' },
  shrub: { src: shrub, width: 0.5, motion: 'sway' },
  primate: { src: primate, width: 0.38, motion: 'bob' },
  songbird: { src: songbird, width: 0.32, motion: 'bob' },
  'large-bird': { src: largeBird, width: 0.4, motion: 'bob' },
  'small-mammal': { src: smallMammal, width: 0.36, motion: 'bob' },
  'mid-mammal': { src: midMammal, width: 0.44, motion: 'bob' },
  reptile: { src: reptile, width: 0.38, motion: 'bob' },
  insect: { src: insect, width: 0.34, motion: 'bob' },
}

export const GRASS_SPRITE: GardenSprite = { src: grass, width: 0.4, motion: 'none' }
