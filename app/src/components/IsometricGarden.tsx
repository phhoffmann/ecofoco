import { useMemo, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { depthSort, pickTile, placeOnPlot, tileCenter, tileNoise, tileToScreen, type TilePos } from '../domain/iso'
import { SPECIES_CATALOG, type Species } from '../domain/species'
import type { CollectedEntry } from '../domain/types'
import { ARCHETYPE_SPRITES, GRASS_SPRITE, type GardenSprite } from './gardenSprites'

// Scene geometry in logical units. The scene scales to its container width, so everything is
// positioned in percentages of these dimensions and taps are mapped back the same way.
const TILE = { width: 64, height: 32 }
const SOIL_DEPTH = 14
const GRASS_LIP = 4
const SHADOW_DROP = SOIL_DEPTH + 6
const HEADROOM = 100 // room above the back tile for tall trees
const PADDING = 8
// Sprites stand slightly in front of the tile center so their base reads as on the ground.
const FOOT_OFFSET = TILE.height * 0.15
const DECOR_DENSITY = 0.25

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
  onSelectSpecies: (speciesId: string) => void
}

export function IsometricGarden({ entries, onSelectSpecies }: IsometricGardenProps) {
  const { t } = useTranslation()
  const [poppedKey, setPoppedKey] = useState<string | null>(null)

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
    const scene: SceneSprite[] = layout.placements.map((p) => ({
      key: p.item.entry.id,
      col: p.col,
      row: p.row,
      sprite: ARCHETYPE_SPRITES[p.item.species.archetype],
    }))
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Offset noise so decoration doesn't follow the fill order.
        if (!occupied.has(`${col},${row}`) && tileNoise({ col: col + 31, row: row + 7 }) < DECOR_DENSITY) {
          scene.push({ key: `decor-${col}-${row}`, col, row, sprite: GRASS_SPRITE })
        }
      }
    }
    return depthSort(scene)
  }, [layout, size])

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
    setPoppedKey(hit.item.entry.id)
    onSelectSpecies(hit.item.species.id)
  }

  const at = (x: number, y: number) => `${origin.x + x},${origin.y + y}`
  const halfW = (size * TILE.width) / 2
  const halfH = (size * TILE.height) / 2
  const left = { x: -halfW, y: halfH }
  const bottom = { x: 0, y: size * TILE.height }
  const right = { x: halfW, y: halfH }
  const face = (a: { x: number; y: number }, b: { x: number; y: number }, depth: number) =>
    [at(a.x, a.y), at(b.x, b.y), at(b.x, b.y + depth), at(a.x, a.y + depth)].join(' ')

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
          <polygon
            points={[
              at(0, SHADOW_DROP),
              at(right.x, right.y + SHADOW_DROP),
              at(bottom.x, bottom.y + SHADOW_DROP),
              at(left.x, left.y + SHADOW_DROP),
            ].join(' ')}
            fill="black"
            opacity={0.3}
          />
          <polygon points={face(left, bottom, SOIL_DEPTH)} fill="#8b5a2b" />
          <polygon points={face(bottom, right, SOIL_DEPTH)} fill="#6e4421" />
          <polygon points={face(left, bottom, GRASS_LIP)} fill="#3fae80" />
          <polygon points={face(bottom, right, GRASS_LIP)} fill="#34996f" />
          {Array.from({ length: size * size }, (_, i) => {
            const pos = { col: i % size, row: Math.floor(i / size) }
            const top = tileToScreen(pos, TILE)
            const points = [
              at(top.x, top.y),
              at(top.x + TILE.width / 2, top.y + TILE.height / 2),
              at(top.x, top.y + TILE.height),
              at(top.x - TILE.width / 2, top.y + TILE.height / 2),
            ].join(' ')
            return <polygon key={i} points={points} fill={(pos.col + pos.row) % 2 ? '#5cc995' : '#66d39e'} />
          })}
        </svg>

        {sprites.map((s, i) => {
          const center = tileCenter(s, TILE)
          return (
            <div
              key={s.key}
              className="pointer-events-none absolute"
              style={{
                left: `${((origin.x + center.x) / sceneWidth) * 100}%`,
                top: `${((origin.y + center.y + FOOT_OFFSET) / sceneHeight) * 100}%`,
                width: `${((s.sprite.width * TILE.width) / sceneWidth) * 100}%`,
                transform: 'translate(-50%, -100%)',
                zIndex: i + 1,
              }}
            >
              <div
                className={s.key === poppedKey ? 'garden-pop' : undefined}
                onAnimationEnd={(e) => {
                  if (e.target === e.currentTarget) setPoppedKey(null)
                }}
              >
                <img
                  src={s.sprite.src}
                  alt=""
                  draggable={false}
                  className={`block w-full ${s.sprite.motion === 'none' ? '' : `garden-${s.sprite.motion}`}`}
                  style={{ animationDelay: `${-tileNoise(s) * 4}s` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {layout.overflow > 0 && (
        <p className="mt-2 text-center text-xs text-emerald-400">
          {t('collection.garden.overflow', { count: layout.overflow })}
        </p>
      )}

      {/* Tile picking is pointer-only; this list gives keyboard and screen-reader access. */}
      <ul className="sr-only">
        {layout.placements.map((p) => (
          <li key={p.item.entry.id}>
            <button onClick={() => onSelectSpecies(p.item.species.id)}>{t(`species.${p.item.species.id}.name`)}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
