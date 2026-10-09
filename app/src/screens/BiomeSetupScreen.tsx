import { useTranslation } from 'react-i18next'
import { ARCHETYPE_SPRITES, footOrigin, footTranslate, type GardenSprite } from '../components/gardenSprites'
import { GroundTile } from '../components/GroundTile'
import { DetectResultMessage, HomeBiomePicker } from '../components/HomeBiomePicker'
import { MapPinIcon } from '../components/icons'
import { Button, Overline } from '../components/ui'
import { FALLBACK_BIOME } from '../domain/biome'
import { useDetectHome } from '../components/useDetectHome'
import { useBiomeStore } from '../stores/biomeStore'

// A tiny garden for the welcome screen: [sprite, x, y] with x/y as % of the tile, back to front.
const HERO: [GardenSprite, number, number][] = [
  [ARCHETYPE_SPRITES.palm, 34, 34],
  [ARCHETYPE_SPRITES['flowering-tree'], 64, 40],
  [ARCHETYPE_SPRITES.shrub, 46, 58],
  [ARCHETYPE_SPRITES['small-mammal'], 28, 64],
  [ARCHETYPE_SPRITES.songbird, 70, 66],
]

function HeroGarden() {
  return (
    <div aria-hidden className="relative mx-auto aspect-[2/1.5] w-56">
      <span className="glow-pulse absolute inset-x-4 top-6 bottom-0 rounded-full bg-accent/20 blur-2xl" />
      <GroundTile biome={FALLBACK_BIOME} width={200} className="absolute inset-x-0 bottom-0 w-full" />
      {/* Sprites stand on the tile's top face, which spans the bottom 116/150 of the box. */}
      {HERO.map(([sprite, x, y], i) => (
        <div
          key={i}
          className="garden-grow absolute"
          style={{
            left: `${x}%`,
            top: `${22 + (y / 100) * 66}%`,
            width: `${sprite.width * 32}%`,
            translate: footTranslate(sprite),
            transformOrigin: footOrigin(sprite),
            animationDelay: `${150 + i * 90}ms`,
          }}
        >
          <img
            src={sprite.src}
            alt=""
            className={`w-full garden-${sprite.motion}`}
            style={{ transformOrigin: footOrigin(sprite), animationDuration: '4s' }}
          />
        </div>
      ))}
    </div>
  )
}

/** First-run onboarding: finds the home Biome from coarse location, or lets the user pick it. */
export function BiomeSetupScreen() {
  const { t } = useTranslation()
  const setHome = useBiomeStore((s) => s.setHome)
  const { detecting, result, detect } = useDetectHome()

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
