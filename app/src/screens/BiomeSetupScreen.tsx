import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ARCHETYPE_SPRITES, type GardenSprite } from '../components/gardenSprites'
import { DetectResultMessage, HomeBiomePicker } from '../components/HomeBiomePicker'
import { MapPinIcon } from '../components/icons'
import { Button, Overline } from '../components/ui'
import { BIOME_GROUND } from '../components/biomeGround'
import { FALLBACK_BIOME } from '../domain/biome'
import { useBiomeStore, type DetectResult } from '../stores/biomeStore'

// A tiny garden for the welcome screen: [sprite, x, y] with x/y as % of the tile, back to front.
const HERO: [GardenSprite, number, number][] = [
  [ARCHETYPE_SPRITES.palm, 34, 34],
  [ARCHETYPE_SPRITES['flowering-tree'], 64, 40],
  [ARCHETYPE_SPRITES.shrub, 46, 58],
  [ARCHETYPE_SPRITES['small-mammal'], 28, 64],
  [ARCHETYPE_SPRITES.songbird, 70, 66],
]

function HeroGarden() {
  const ground = BIOME_GROUND[FALLBACK_BIOME]
  return (
    <div aria-hidden className="relative mx-auto aspect-[2/1.5] w-56">
      <span className="glow-pulse absolute inset-x-4 top-6 bottom-0 rounded-full bg-accent/20 blur-2xl" />
      <svg viewBox="0 0 200 116" className="absolute inset-x-0 bottom-0 w-full">
        <polygon points="0,50 100,100 100,116 0,66" fill={ground.soil[0]} />
        <polygon points="100,100 200,50 200,66 100,116" fill={ground.soil[1]} />
        <polygon points="0,50 100,100 100,105 0,55" fill={ground.lip[0]} />
        <polygon points="100,100 200,50 200,55 100,105" fill={ground.lip[1]} />
        <polygon points="100,0 200,50 100,100 0,50" fill={ground.tile[0]} />
      </svg>
      {/* Sprites stand on the tile's top face, which spans the bottom 116/150 of the box. */}
      {HERO.map(([sprite, x, y], i) => (
        <div
          key={i}
          className="garden-grow absolute"
          style={{
            left: `${x}%`,
            top: `${22 + (y / 100) * 66}%`,
            width: `${sprite.width * 32}%`,
            translate: `${-sprite.footX * 100}% ${-sprite.footY * 100}%`,
            transformOrigin: `${sprite.footX * 100}% ${sprite.footY * 100}%`,
            animationDelay: `${150 + i * 90}ms`,
          }}
        >
          <img
            src={sprite.src}
            alt=""
            className={`w-full garden-${sprite.motion}`}
            style={{ transformOrigin: `${sprite.footX * 100}% ${sprite.footY * 100}%`, animationDuration: '4s' }}
          />
        </div>
      ))}
    </div>
  )
}

/** First-run onboarding: finds the home Biome from coarse location, or lets the user pick it. */
export function BiomeSetupScreen() {
  const { t } = useTranslation()
  const detectHome = useBiomeStore((s) => s.detectHome)
  const setHome = useBiomeStore((s) => s.setHome)
  const [detecting, setDetecting] = useState(false)
  const [result, setResult] = useState<DetectResult | null>(null)

  async function detect() {
    setDetecting(true)
    setResult(await detectHome())
    setDetecting(false)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-gutter py-6 text-center">
      <HeroGarden />
      <div className="enter space-y-2">
        <h1 className="text-title text-ink">{t('biomeSetup.title')}</h1>
        <p className="mx-auto max-w-80 text-body text-ink-muted">{t('biomeSetup.subtitle')}</p>
      </div>
      <Button
        variant="primary"
        size="lg"
        icon={MapPinIcon}
        className="w-full max-w-sm"
        onClick={() => void detect()}
        disabled={detecting}
      >
        {detecting ? t('biomeSetup.detecting') : t('biomeSetup.useLocation')}
      </Button>
      {result && <DetectResultMessage result={result} />}
      <div className="w-full max-w-sm space-y-3">
        <Overline>{t('biomeSetup.pick')}</Overline>
        <HomeBiomePicker disabled={detecting} onPick={(biome) => void setHome(biome)} />
      </div>
    </div>
  )
}
