import { useEffect, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { rarityIn, speciesName } from '../domain/species'
import { useActiveBiome } from '../stores/biomeStore'
import { useCelebrationStore } from '../stores/celebrationStore'
import { RARITY_STYLES } from './rarity'

/** How long a celebration stays up; matches the celebrate-overlay animation in index.css. */
export const CELEBRATION_MS = 1900

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

/** Sparkle burst and species reveal shown whenever a CollectedEntry is created. Tap to dismiss. */
export function CelebrationOverlay() {
  const { t, i18n } = useTranslation()
  const species = useCelebrationStore((s) => s.species)
  const seq = useCelebrationStore((s) => s.seq)
  const dismiss = useCelebrationStore((s) => s.dismiss)
  const biome = useActiveBiome()

  useEffect(() => {
    if (!species) return
    const timer = window.setTimeout(dismiss, CELEBRATION_MS)
    return () => window.clearTimeout(timer)
  }, [species, seq, dismiss])

  if (!species) return null

  const tier = rarityIn(species, biome)
  const rarity = RARITY_STYLES[tier]
  const name = speciesName(species, i18n.language)

  return (
    <div
      key={seq}
      role="status"
      aria-live="polite"
      onClick={dismiss}
      className="celebrate-overlay fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-emerald-950/85 px-6 backdrop-blur-sm"
    >
      <div className="relative flex size-44 items-center justify-center">
        <span
          aria-hidden
          className="celebrate-ring absolute inset-0 rounded-full border-4"
          style={{ borderColor: rarity.color }}
        />
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            aria-hidden
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
        <img
          src={species.image}
          alt={name}
          className={`celebrate-reveal size-36 rounded-3xl object-cover shadow-2xl ring-4 ${rarity.ring}`}
        />
      </div>
      <p className="celebrate-twinkle text-sm font-medium tracking-wide text-emerald-200 uppercase">
        ✨ {t('celebration.title')} ✨
      </p>
      <p className="celebrate-reveal text-center text-2xl font-semibold text-emerald-50">{name}</p>
      <span className={`celebrate-reveal rounded-full px-3 py-1 text-xs font-semibold ${rarity.badge}`}>
        {t(`rarity.${tier}`)}
      </span>
      <p className="text-xs text-emerald-400">{t('celebration.tapToContinue')}</p>
    </div>
  )
}
