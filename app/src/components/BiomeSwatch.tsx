import type { BiomeId } from '../domain/biome'
import { BIOME_GROUND } from './biomeGround'

/** A single isometric ground tile in the Biome's colours: the Biome's "icon" in lists and pickers. */
export function BiomeSwatch({ biome, className = 'w-9' }: { biome: BiomeId; className?: string }) {
  const ground = BIOME_GROUND[biome]
  return (
    <svg viewBox="0 0 40 30" className={`shrink-0 ${className}`} aria-hidden>
      <polygon points="0,10 20,20 20,30 0,20" fill={ground.soil[0]} />
      <polygon points="20,20 40,10 40,20 20,30" fill={ground.soil[1]} />
      <polygon points="0,10 20,20 20,23 0,13" fill={ground.lip[0]} />
      <polygon points="20,20 40,10 40,13 20,23" fill={ground.lip[1]} />
      <polygon points="20,0 40,10 20,20 0,10" fill={ground.tile[0]} />
      <polygon points="20,4 30,9 20,14 10,9" fill={ground.accent.fill} opacity={0.9} />
    </svg>
  )
}
