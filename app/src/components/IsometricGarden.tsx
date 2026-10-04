import { useId, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { BiomeId } from '../domain/biome'
import {
  depthSort,
  pickTile,
  placeOnPlot,
  tileCenter,
  tileNoise,
  tileToScreen,
  type Point,
  type TilePos,
} from '../domain/iso'
import { SPECIES_CATALOG, speciesName, type Species } from '../domain/species'
import type { CollectedEntry } from '../domain/types'
import { BIOME_GROUND, type GroundTexture } from './biomeGround'
import { ARCHETYPE_SPRITES, BIOME_DECOR, type GardenSprite, type SpriteMotion } from './gardenSprites'

// Scene geometry in logical units. The scene scales to its container width, so everything is
// positioned in percentages of these dimensions and taps are mapped back the same way.
const TILE = { width: 64, height: 32 }
const SOIL_DEPTH = 30
const GRASS_LIP = 7
const SHADOW_DROP = SOIL_DEPTH + 8
const PEBBLES_PER_TILE_EDGE = 1.5
const HEADROOM = 110 // room above the back tile for tall trees
const PADDING = 8
// Sprites stand slightly in front of the tile center so their base reads as on the ground.
const FOOT_OFFSET = TILE.height * 0.12
const DECOR_DENSITY = 0.3
const PARTICLE_COUNT = 9
// Sprites regrow back to front when the period changes; the whole wave stays under ~0.6 s.
const GROW_STAGGER_MS = 30
const GROW_MAX_DELAY_MS = 520

// Base cycle per idle motion; each sprite gets a stable ±15% so neighbours drift out of step.
const MOTION_SECONDS: Record<SpriteMotion, number> = {
  sway: 5,
  rustle: 3.2,
  bob: 2.4,
  hop: 6,
  hover: 1.4,
  breathe: 3.6,
  none: 0,
}

const SPECIES_BY_ID = new Map(SPECIES_CATALOG.map((s) => [s.id, s]))

interface GardenItem {
  entry: CollectedEntry
  species: Species
}

interface SceneSprite extends TilePos {
  key: string
  sprite: GardenSprite
}

interface IsometricGardenProps {
  /** Entries to show, already scoped to a period. */
  entries: CollectedEntry[]
  /** Picks the ground, decoration and ambient particles. */
  biome: BiomeId
  onSelectSpecies: (speciesId: string) => void
  /** Changing it replays the grow-in wave, e.g. when switching day / week / month. */
  transitionKey?: string
}

const isAccentTile = ({ col, row }: TilePos, density: number) => tileNoise({ col: col + 13, row: row + 29 }) < density

export function IsometricGarden({ entries, biome, onSelectSpecies, transitionKey }: IsometricGardenProps) {
  const { t, i18n } = useTranslation()
  const uid = useId()
  // `seq` makes a second tap on the same sprite replay the pop.
  const [popped, setPopped] = useState<{ sprite: SceneSprite; seq: number } | null>(null)
  const ground = BIOME_GROUND[biome]

  const layout = useMemo(() => {
    const items = [...entries]
      .sort((a, b) => a.collectedAt.localeCompare(b.collectedAt))
      .flatMap((entry): GardenItem[] => {
        const species = SPECIES_BY_ID.get(entry.speciesId)
        return species ? [{ entry, species }] : []
      })
    return placeOnPlot(items)
  }, [entries])

  const size = layout.plotSize
  const sceneWidth = size * TILE.width + PADDING * 2
  const sceneHeight = HEADROOM + size * TILE.height + SOIL_DEPTH + PADDING
  const origin = { x: sceneWidth / 2, y: HEADROOM }

  const sprites = useMemo(() => {
    const occupied = new Set(layout.placements.map((p) => `${p.col},${p.row}`))
    const decor = BIOME_DECOR[biome]
    const scene: SceneSprite[] = layout.placements.map((p) => ({
      key: p.item.entry.id,
      col: p.col,
      row: p.row,
      sprite: ARCHETYPE_SPRITES[p.item.species.archetype],
    }))
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const pos = { col, row }
        // Offset noise so decoration doesn't follow the fill order.
        if (occupied.has(`${col},${row}`) || tileNoise({ col: col + 31, row: row + 7 }) >= DECOR_DENSITY) continue
        const choices = isAccentTile(pos, ground.accent.density) && ground.accent.water ? decor.water : decor.land
        if (choices.length === 0) continue
        const pick = choices[Math.floor(tileNoise({ col: col + 5, row: row + 17 }) * choices.length)]
        scene.push({ key: `decor-${col}-${row}`, col, row, sprite: pick })
      }
    }
    return depthSort(scene)
  }, [layout, size, biome, ground.accent])

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    const scale = sceneWidth / rect.width
    const point = {
      x: (e.clientX - rect.left) * scale - origin.x,
      y: (e.clientY - rect.top) * scale - origin.y,
    }
    const tile = pickTile(point, TILE, size)
    if (!tile) return
    const hit = layout.placements.find((p) => p.col === tile.col && p.row === tile.row)
    if (!hit) return
    const sprite = sprites.find((s) => s.key === hit.item.entry.id)
    if (sprite) setPopped((prev) => ({ sprite, seq: (prev?.seq ?? 0) + 1 }))
    onSelectSpecies(hit.item.species.id)
  }

  const at = (x: number, y: number) => `${origin.x + x},${origin.y + y}`
  const pct = (x: number, y: number) => `${((origin.x + x) / sceneWidth) * 100}% ${((origin.y + y) / sceneHeight) * 100}%`
  const halfW = (size * TILE.width) / 2
  const halfH = (size * TILE.height) / 2
  const top = { x: 0, y: 0 }
  const left = { x: -halfW, y: halfH }
  const bottom = { x: 0, y: size * TILE.height }
  const right = { x: halfW, y: halfH }
  const face = (a: Point, b: Point, from: number, to: number) =>
    [at(a.x, a.y + from), at(b.x, b.y + from), at(b.x, b.y + to), at(a.x, a.y + to)].join(' ')
  const diamond = (pos: TilePos) => {
    const p = tileToScreen(pos, TILE)
    return [
      at(p.x, p.y),
      at(p.x + TILE.width / 2, p.y + TILE.height / 2),
      at(p.x, p.y + TILE.height),
      at(p.x - TILE.width / 2, p.y + TILE.height / 2),
    ].join(' ')
  }
  // Grass hanging over the soil edge: a zigzag along the bottom of the lip.
  const lip = (a: Point, b: Point) => {
    const teeth = size * 3
    const edge = Array.from({ length: teeth + 1 }, (_, i) => {
      const f = i / teeth
      // Uneven teeth, so the overhang reads as grass rather than a saw blade.
      const drop = GRASS_LIP + (i % 2 ? 2 + tileNoise({ col: i, row: 3 }) * 3 : -1)
      return at(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f + drop)
    })
    return [at(a.x, a.y), at(b.x, b.y), ...edge.reverse()].join(' ')
  }
  // Pebbles in the soil, placed by stable noise along each front face.
  const pebbles = (a: Point, b: Point, seed: number) =>
    Array.from({ length: Math.round(size * PEBBLES_PER_TILE_EDGE) }, (_, i) => {
      const along = (i + 0.25 + tileNoise({ col: i, row: seed }) * 0.5) / Math.round(size * PEBBLES_PER_TILE_EDGE)
      const depth = GRASS_LIP + 4 + tileNoise({ col: seed, row: i }) * (SOIL_DEPTH - GRASS_LIP - 8)
      const r = 1.6 + tileNoise({ col: i + seed, row: i }) * 1.8
      return { x: origin.x + a.x + (b.x - a.x) * along, y: origin.y + a.y + (b.y - a.y) * along + depth, r }
    })
  const gridLines = Array.from({ length: size - 1 }, (_, i) => {
    const n = i + 1
    const a = tileToScreen({ col: n, row: 0 }, TILE)
    const b = tileToScreen({ col: n, row: size }, TILE)
    const c = tileToScreen({ col: 0, row: n }, TILE)
    const d = tileToScreen({ col: size, row: n }, TILE)
    return `M${at(a.x, a.y)} L${at(b.x, b.y)} M${at(c.x, c.y)} L${at(d.x, d.y)}`
  }).join(' ')

  const tiles = Array.from({ length: size * size }, (_, i) => ({ col: i % size, row: Math.floor(i / size) }))

  return (
    <div>
      <div
        role="group"
        aria-label={t('collection.garden.sceneLabel')}
        onClick={handleClick}
        className="relative isolate mx-auto w-full max-w-md select-none"
        style={{ aspectRatio: `${sceneWidth} / ${sceneHeight}` }}
      >
        <svg viewBox={`0 0 ${sceneWidth} ${sceneHeight}`} className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <GroundPattern id={`${uid}-base`} texture={ground.texture} marks={ground.marks} />
            <GroundPattern id={`${uid}-accent`} texture={ground.accent.texture} marks={[ground.accent.marks, ground.accent.marks]} />
            <radialGradient id={`${uid}-shadow`}>
              <stop offset="0" stopColor="#000" stopOpacity="0.32" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <polygon
            points={[top, right, bottom, left].map((p) => at(p.x, p.y + SHADOW_DROP)).join(' ')}
            fill="black"
            opacity={0.28}
          />
          <polygon points={face(left, bottom, 0, SOIL_DEPTH)} fill={ground.soil[0]} />
          <polygon points={face(bottom, right, 0, SOIL_DEPTH)} fill={ground.soil[1]} />
          {/* A darker stratum low in the soil, so the slab reads as earth rather than a flat edge. */}
          <polygon points={face(left, bottom, SOIL_DEPTH * 0.62, SOIL_DEPTH)} fill="black" opacity={0.14} />
          <polygon points={face(bottom, right, SOIL_DEPTH * 0.62, SOIL_DEPTH)} fill="black" opacity={0.18} />
          {[...pebbles(left, bottom, 11), ...pebbles(bottom, right, 23)].map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx={p.r * 1.4} ry={p.r} fill="black" opacity={0.16} />
          ))}
          <polygon points={lip(left, bottom)} fill={ground.lip[0]} />
          <polygon points={lip(bottom, right)} fill={ground.lip[1]} />
          {tiles.map((pos) => {
            const accent = isAccentTile(pos, ground.accent.density)
            return (
              <g key={`${pos.col},${pos.row}`}>
                <polygon points={diamond(pos)} fill={accent ? ground.accent.fill : ground.tile[(pos.col + pos.row) % 2]} />
                <polygon points={diamond(pos)} fill={`url(#${uid}-${accent ? 'accent' : 'base'})`} opacity={0.75} />
              </g>
            )
          })}
          <path d={gridLines} stroke="white" strokeOpacity={0.08} strokeWidth={0.6} fill="none" />
          {/* Rim light along the two front edges of the plot. */}
          <polyline points={[left, bottom, right].map((p) => at(p.x, p.y)).join(' ')} stroke="white" strokeOpacity={0.25} strokeWidth={0.8} fill="none" />
          {sprites.map((s) => {
            const center = tileCenter(s, TILE)
            const rx = s.sprite.width * TILE.width * 0.42
            return (
              <ellipse
                key={s.key}
                cx={origin.x + center.x}
                cy={origin.y + center.y + FOOT_OFFSET}
                rx={rx}
                ry={rx * 0.45}
                fill={`url(#${uid}-shadow)`}
              />
            )
          })}
          {popped && (
            <polygon
              key={popped.seq}
              points={diamond(popped.sprite)}
              fill="white"
              opacity={0}
              className="garden-tile-flash"
            />
          )}
        </svg>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ clipPath: `polygon(${[top, right, bottom, left].map((p) => pct(p.x, p.y)).join(', ')})` }}
        >
          <div className="garden-sunlight absolute inset-0" />
          <div className="garden-cloud absolute top-[20%] left-0 h-1/2 w-3/5 rounded-full" />
        </div>

        <div key={transitionKey} className="absolute inset-0">
          {sprites.map((s, i) => {
            const center = tileCenter(s, TILE)
            const noise = tileNoise(s)
            const seconds = MOTION_SECONDS[s.sprite.motion] * (0.85 + noise * 0.3)
            const foot = `${s.sprite.footX * 100}% ${s.sprite.footY * 100}%`
                        return (
              <div
                key={s.key}
                className="pointer-events-none absolute"
                style={{
                  left: `${((origin.x + center.x) / sceneWidth) * 100}%`,
                  top: `${((origin.y + center.y + FOOT_OFFSET) / sceneHeight) * 100}%`,
                  width: `${((s.sprite.width * TILE.width) / sceneWidth) * 100}%`,
                  transform: `translate(${-s.sprite.footX * 100}%, ${-s.sprite.footY * 100}%)`,
                  zIndex: i + 1,
                }}
              >
                <div
                  className="garden-grow"
                  style={{ transformOrigin: foot, animationDelay: `${Math.min(i * GROW_STAGGER_MS, GROW_MAX_DELAY_MS)}ms` }}
                >
                  <div
                    key={popped?.sprite.key === s.key ? popped.seq : 0}
                    className={popped?.sprite.key === s.key ? 'garden-pop' : undefined}
                    style={{ transformOrigin: foot }}
                  >
                    <img
                      src={s.sprite.src}
                      alt=""
                      draggable={false}
                      className={`block w-full ${s.sprite.motion === 'none' ? '' : `garden-${s.sprite.motion}`}`}
                      style={{
                        aspectRatio: `1 / ${s.sprite.aspect}`,
                        transformOrigin: foot,
                        animationDuration: seconds ? `${seconds}s` : undefined,
                        animationDelay: seconds ? `${-noise * seconds}s` : undefined,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Motes biome={biome} />
      </div>

      {layout.overflow > 0 && (
        <p className="mt-2 text-center text-xs text-ink-muted">
          {t('collection.garden.overflow', { count: layout.overflow })}
        </p>
      )}

      {/* Tile picking is pointer-only; this list gives keyboard and screen-reader access. */}
      <ul className="sr-only">
        {layout.placements.map((p) => (
          <li key={p.item.entry.id}>
            <button onClick={() => onSelectSpecies(p.item.species.id)}>{speciesName(p.item.species, i18n.language)}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Tile texture in screen space: small enough that it doesn't need to follow the isometric projection. */
function GroundPattern({ id, texture, marks }: { id: string; texture: GroundTexture; marks: [string, string] }) {
  const [light, dark] = marks
  return (
    <pattern id={id} width={16} height={8} patternUnits="userSpaceOnUse">
      {texture === 'blades' && (
        <g strokeWidth={0.7} strokeLinecap="round" fill="none">
          <path d="M3 6.2 l0.5 -2 M4.2 6.2 l-0.3 -1.6" stroke={light} />
          <path d="M11 3 l0.4 -1.7 M12 3 l-0.4 -1.4" stroke={light} />
          <path d="M8 7.4 l0.3 -1.2" stroke={dark} />
          <circle cx={14.5} cy={6.5} r={0.5} fill={dark} stroke="none" />
        </g>
      )}
      {texture === 'specks' && (
        <g>
          <circle cx={3} cy={2} r={0.8} fill={light} />
          <circle cx={10} cy={5.5} r={0.6} fill={dark} />
          <circle cx={13.5} cy={1.5} r={0.5} fill={dark} />
          <path d="M5 6.5 l2.2 -0.8 l1.2 0.9" stroke={dark} strokeWidth={0.5} fill="none" />
        </g>
      )}
      {texture === 'ripples' && (
        <path d="M1 3 q2 -1.4 4 0 M9 6.5 q2 -1.4 4 0" stroke={light} strokeWidth={0.6} strokeLinecap="round" fill="none" />
      )}
    </pattern>
  )
}

/** Pollen, dust or fireflies drifting over the plot, coloured per Biome. Hidden with reduced motion. */
function Motes({ biome }: { biome: BiomeId }) {
  const { color, glow } = BIOME_GROUND[biome].particles
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const a = tileNoise({ col: i, row: 3 })
        const b = tileNoise({ col: 7, row: i })
        const size = 2 + a * 2.5
        return (
          <span
            key={i}
            className={`absolute rounded-full ${glow ? 'garden-firefly' : 'garden-mote'}`}
            style={
              {
                left: `${8 + a * 84}%`,
                top: `${30 + b * 55}%`,
                width: size,
                height: size,
                background: color,
                boxShadow: glow ? `0 0 6px 2px ${color}` : undefined,
                animationDuration: `${7 + b * 6}s`,
                animationDelay: `${-a * 10}s`,
                '--drift-x': `${(b - 0.5) * 40}px`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
