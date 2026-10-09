import type { CSSProperties, ReactNode } from 'react'
import type { BiomeId } from '../domain/biome'
import { BIOME_GROUND } from './biomeGround'

const SOIL_DEPTH = 16
const LIP_DEPTH = 5

interface GroundTileProps {
  biome: BiomeId
  /** viewBox width; the top face is half as tall, so the tile is `width / 2 + 16` tall. */
  width: number
  className?: string
  style?: CSSProperties
  /** Extra shapes drawn on top of the tile, in the same viewBox. */
  children?: ReactNode
}

/** One isometric garden tile — soil, grass lip and top face — in the Biome's ground colours. */
export function GroundTile({ biome, width, className, style, children }: GroundTileProps) {
  const ground = BIOME_GROUND[biome]
  const w = width
  const h = width / 2
  const face = (from: number, to: number) => ({
    left: `0,${h / 2 + from} ${w / 2},${h + from} ${w / 2},${h + to} 0,${h / 2 + to}`,
    right: `${w / 2},${h + from} ${w},${h / 2 + from} ${w},${h / 2 + to} ${w / 2},${h + to}`,
  })
  const soil = face(0, SOIL_DEPTH)
  const lip = face(0, LIP_DEPTH)
  return (
    <svg viewBox={`0 0 ${w} ${h + SOIL_DEPTH}`} className={className} style={style} aria-hidden>
      <polygon points={soil.left} fill={ground.soil[0]} />
      <polygon points={soil.right} fill={ground.soil[1]} />
      <polygon points={lip.left} fill={ground.lip[0]} />
      <polygon points={lip.right} fill={ground.lip[1]} />
      <polygon points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`} fill={ground.tile[0]} />
      {children}
    </svg>
  )
}
