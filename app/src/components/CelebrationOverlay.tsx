import { useId, useRef, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { CatchReveal } from '../domain/catch'
import { rarityIn, speciesName } from '../domain/species'
import { useCelebrationStore } from '../stores/celebrationStore'
import { useNavigationStore } from '../stores/navigationStore'
import { useSettingsStore } from '../stores/settingsStore'
import { GardenIcon, GridIcon, SparkleIcon } from './icons'
import { RARITY_STYLES } from './rarity'
import { Button } from './ui'
import { useModal } from './useModal'

const SPARKLE_COUNT = 14
const SPARKLE_DISTANCE_PX = 130

const SPARKLES = Array.from({ length: SPARKLE_COUNT }, (_, i) => {
  const angle = (i / SPARKLE_COUNT) * Math.PI * 2
  // Alternate near/far so the burst doesn't read as a perfect ring.
  const distance = SPARKLE_DISTANCE_PX * (i % 2 ? 0.7 : 1)
  return {
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance),
    size: i % 3 === 0 ? 10 : 6,
    delay: (i % 4) * 40,
  }
})

/**
 * The one reveal per catch, shown whenever a CollectedEntry is created: new or seen before, progress
 * through the Biome, points earned, and where to go next. Stays until the user taps through it.
 */
export function CelebrationOverlay() {
  const reveal = useCelebrationStore((s) => s.reveal)
  const seq = useCelebrationStore((s) => s.seq)
  // Keyed per catch, so each one mounts fresh: animations replay and focus moves in again.
  return reveal ? <RevealDialog key={seq} reveal={reveal} /> : null
}

function RevealDialog({ reveal }: { reveal: CatchReveal }) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const dismiss = useCelebrationStore((s) => s.dismiss)
  const setTab = useNavigationStore((s) => s.setTab)
  const collectionView = useSettingsStore((s) => s.collectionView)
  const dialogRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const handleKeyDown = useModal(dialogRef, dismiss, primaryRef)

  const { species } = reveal
  const tier = rarityIn(species, reveal.biome)
  const rarity = RARITY_STYLES[tier]
  const name = speciesName(species, i18n.language)
  const inGarden = collectionView === 'isometric'

  function seeInCollection() {
    setTab('collection')
    dismiss()
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
      onKeyDown={handleKeyDown}
      className="celebrate-overlay fixed inset-0 z-30 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-canvas/90 px-6 py-8 backdrop-blur-sm"
    >
      <div aria-hidden className="pointer-events-none relative flex size-44 shrink-0 items-center justify-center">
        <span className="celebrate-ring absolute inset-0 rounded-full border-4" style={{ borderColor: rarity.color }} />
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="celebrate-sparkle absolute top-1/2 left-1/2 rounded-full"
            style={
              {
                width: s.size,
                height: s.size,
                marginTop: -s.size / 2,
                marginLeft: -s.size / 2,
                background: rarity.color,
                boxShadow: `0 0 8px ${rarity.color}`,
                animationDelay: `${s.delay}ms`,
                '--dx': `${s.dx}px`,
                '--dy': `${s.dy}px`,
              } as CSSProperties
            }
          />
        ))}
        <img src={species.image} alt="" className={`celebrate-reveal size-36 rounded-card object-cover shadow-2xl ring-4 ${rarity.ring}`} />
      </div>

      <p className="celebrate-twinkle flex items-center gap-1.5 text-overline text-accent uppercase">
        <SparkleIcon className="size-4" /> {t('celebration.title')} <SparkleIcon className="size-4" />
      </p>
      <h2 id={titleId} className="celebrate-reveal text-center text-title text-ink">
        {name}
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {reveal.isNew ? (
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-overline text-on-accent uppercase">
            {t('celebration.new')}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-surface-raised px-3 py-1 text-overline text-ink-muted ring-1 ring-line">
            {t('celebration.seen', { count: reveal.timesCollected })}
          </span>
        )}
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-overline ${rarity.badge}`}>{t(`rarity.${tier}`)}</span>
      </div>
      <p className="text-center text-body text-ink-muted">
        {t('celebration.dex', { count: reveal.dexCollected, total: reveal.dexTotal, biome: t(`biome.${reveal.biome}`) })}
        {reveal.points > 0 && (
          <span className="font-extrabold text-accent"> · {t('celebration.points', { count: reveal.points })}</span>
        )}
      </p>

      <div className="mt-3 flex w-full max-w-sm flex-col gap-2">
        <Button ref={primaryRef} variant="primary" size="lg" icon={inGarden ? GardenIcon : GridIcon} onClick={seeInCollection}>
          {t(inGarden ? 'celebration.seeInGarden' : 'celebration.seeInCollection')}
        </Button>
        <Button variant="ghost" onClick={dismiss}>
          {t('celebration.continue')}
        </Button>
      </div>
    </div>
  )
}
