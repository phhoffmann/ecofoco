import type { CSSProperties } from 'react'
import type { BiomeId } from '../domain/biome'
import { STAGE_STARTS, growthStage, progressWithinStage, type GrowthStage } from '../domain/growth'
import type { PlantArchetype } from '../domain/species'
import { BIOME_GROUND } from './biomeGround'
import { FULL_RING_SIZE } from './sproutRing'
import { ARCHETYPE_SPRITES, GROWTH_STAGE_SPRITES, type GardenSprite } from './gardenSprites'

// Display height per stage, in px at the full ring size. The last two stages are the archetype's own shape.
const STAGE_HEIGHT = [70, 96, 120, 172]
/** Everything below is laid out for the full-size ring and scaled down with it. */
const RING = { size: FULL_RING_SIZE, stroke: 10 }

// The ground tile (viewBox 140×86, tile centre at y≈37) sits low in the ring; the plant stands on its centre.
const GROUND = { width: RING.size * 0.46, top: RING.size * 0.6 }
const FOOT_Y = GROUND.top + 37 * (GROUND.width / 140)
const LEAVES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2 + 0.3
  const distance = 60 + (i % 3) * 14
  return {
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance * 0.7 - 30),
    spin: `${(i % 2 ? 1 : -1) * (120 + i * 25)}deg`,
    delay: (i % 4) * 30,
  }
})

function stageSprite(stage: GrowthStage, archetype: PlantArchetype | null): GardenSprite {
  if (stage === 0 || !archetype) return GROWTH_STAGE_SPRITES.seedling
  if (stage === 1) return GROWTH_STAGE_SPRITES.sapling
  return ARCHETYPE_SPRITES[archetype]
}

interface SproutProps {
  /** 0 to 1. */
  progress: number
  /** Shape the plant grows into; unknown before a session starts. */
  archetype: PlantArchetype | null
  biome: BiomeId
  /** `grown` adds the completion glow; `gone` is a failed session, whose Sprout disappears. */
  mood?: 'growing' | 'grown' | 'gone'
  /** Ring diameter in px; see sproutRingSize in sproutRing.ts. */
  size?: number
}

/**
 * The plant at the heart of the Focus screen: a progress ring around a single garden tile, with the plant
 * growing through four stages as the session runs. Each new stage springs up with a small burst of leaves.
 */
export function Sprout({ progress, archetype, biome, mood = 'growing', size = RING.size }: SproutProps) {
  const scale = size / RING.size
  const stage = mood === 'gone' ? 0 : mood === 'grown' ? 3 : growthStage(progress)
  const sprite = stageSprite(stage, archetype)
  // Keep growing a little inside each stage, so the plant visibly moves even between stage changes.
  const withinStage = mood === 'growing' ? progressWithinStage(progress) : 1
  const height = STAGE_HEIGHT[stage] * (0.84 + withinStage * 0.16) * scale
  const ground = BIOME_GROUND[biome]

  const radius = (RING.size - RING.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const shown = mood === 'growing' ? progress : 1

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      {mood === 'grown' && (
        <>
          <span
            aria-hidden
            className="rays-spin absolute inset-0 rounded-full opacity-60"
            style={{
              background:
                'repeating-conic-gradient(from 0deg, color-mix(in oklab, var(--color-accent-strong) 40%, transparent) 0deg 10deg, transparent 10deg 30deg)',
              maskImage: 'radial-gradient(closest-side, black 40%, transparent)',
            }}
          />
          <span aria-hidden className="glow-pulse absolute inset-10 rounded-full bg-accent/30 blur-2xl" />
        </>
      )}

      <svg viewBox={`0 0 ${RING.size} ${RING.size}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="sprout-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-accent-strong)" />
            <stop offset="1" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        <circle
          cx={RING.size / 2}
          cy={RING.size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-raised)"
          strokeWidth={RING.stroke}
        />
        {mood !== 'gone' && (
          <circle
            cx={RING.size / 2}
            cy={RING.size / 2}
            r={radius}
            fill="none"
            stroke="url(#sprout-ring)"
            strokeWidth={RING.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - shown)}
            className="transition-[stroke-dashoffset] duration-500 ease-linear motion-reduce:transition-none"
            style={{ filter: 'drop-shadow(0 0 6px color-mix(in oklab, var(--color-accent) 60%, transparent))' }}
          />
        )}
        {/* A dot where each later stage begins. */}
        {STAGE_STARTS.slice(1).map((start) => {
          const angle = start * Math.PI * 2
          const reached = mood !== 'gone' && shown >= start
          return (
            <circle
              key={start}
              cx={RING.size / 2 + Math.cos(angle) * radius}
              cy={RING.size / 2 + Math.sin(angle) * radius}
              r={reached ? 3.5 : 3}
              fill={reached ? 'var(--color-on-accent)' : 'var(--color-ink-faint)'}
            />
          )
        })}
      </svg>

      <div
        className="absolute rounded-full"
        style={{
          inset: RING.stroke * 2.2 * scale,
          background: 'radial-gradient(circle at 50% 35%, var(--color-surface-raised), var(--color-surface-sunken) 75%)',
        }}
      />

      {/* One garden tile, the same ground as the Biome's garden. */}
      <svg
        viewBox="0 0 140 86"
        className="absolute"
        style={{ top: GROUND.top * scale, left: ((RING.size - GROUND.width) / 2) * scale, width: GROUND.width * scale }}
        aria-hidden
      >
        <polygon points="0,35 70,70 70,86 0,51" fill={ground.soil[0]} />
        <polygon points="70,70 140,35 140,51 70,86" fill={ground.soil[1]} />
        <polygon points="0,35 70,70 70,75 0,40" fill={ground.lip[0]} />
        <polygon points="70,70 140,35 140,40 70,75" fill={ground.lip[1]} />
        <polygon points="70,0 140,35 70,70 0,35" fill={ground.tile[0]} />
        <ellipse cx="70" cy="37" rx="26" ry="11" fill="black" opacity={0.18} />
      </svg>

      {mood !== 'gone' && (
        <div className="absolute" style={{ left: '50%', top: FOOT_Y * scale }}>
          <div
            key={`${stage}-${mood}`}
            className={stage > 0 && mood === 'growing' ? 'stage-in' : mood === 'grown' ? 'pop-in' : undefined}
            style={{ transformOrigin: `${sprite.footX * 100}% ${sprite.footY * 100}%`, translate: `${-sprite.footX * 100}% ${-sprite.footY * 100}%` }}
          >
            <img
              src={sprite.src}
              alt=""
              draggable={false}
              className={`block max-w-none transition-[height] duration-1000 ease-linear motion-reduce:transition-none ${
                stage < 2 ? 'garden-rustle' : 'garden-sway'
              }`}
              style={{
                height,
                aspectRatio: `1 / ${sprite.aspect}`,
                transformOrigin: `${sprite.footX * 100}% ${sprite.footY * 100}%`,
                animationDuration: stage < 2 ? '3.2s' : '5s',
              }}
            />
          </div>
          {stage > 0 && mood === 'growing' && (
            <div key={`burst-${stage}`} aria-hidden>
              {LEAVES.map((leaf, i) => (
                <span
                  key={i}
                  className="leaf-burst absolute left-0 h-2 w-3 rounded-[60%_0] bg-accent-strong"
                  style={
                    {
                      top: -40 * scale,
                      '--dx': `${leaf.dx * scale}px`,
                      '--dy': `${leaf.dy * scale}px`,
                      '--spin': leaf.spin,
                      animationDelay: `${leaf.delay}ms`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
