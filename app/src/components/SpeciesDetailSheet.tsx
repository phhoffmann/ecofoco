import { useId, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import type { CollectedEntry, CollectionMethod } from '../domain/types'
import { rarityIn, speciesDescription, speciesName, type Species } from '../domain/species'
import { useActiveBiome } from '../stores/biomeStore'
import { BottomSheet } from './BottomSheet'
import { CameraIcon, EyeIcon, FootprintsIcon, SproutIcon } from './icons'
import { RARITY_STYLES } from './rarity'
import { Button, Overline } from './ui'

const METHOD_ICONS: Record<CollectionMethod, ComponentType<{ className?: string }>> = {
  focus_session: SproutIcon,
  draw: FootprintsIcon,
  manual_sighting: EyeIcon,
  photo_ai: CameraIcon,
}

function MethodIcon({ method }: { method: CollectionMethod }) {
  const Icon = METHOD_ICONS[method]
  return (
    <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
      <Icon className="size-4" />
    </span>
  )
}

interface SpeciesDetailSheetProps {
  species: Species
  entries: CollectedEntry[]
  onClose: () => void
}

export function SpeciesDetailSheet({ species, entries, onClose }: SpeciesDetailSheetProps) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const rarity = rarityIn(species, useActiveBiome())
  const sortedEntries = [...entries].sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
  const firstEntry = sortedEntries.at(-1)
  const name = speciesName(species, i18n.language)
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })

  return (
    <BottomSheet onClose={onClose} labelledBy={titleId}>
      {(close) => (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <figure>
              <div className="relative overflow-hidden rounded-card bg-surface-sunken">
                <img src={species.image} alt={name} className="enter aspect-[4/3] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                <span
                  className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-overline shadow ${RARITY_STYLES[rarity].badge}`}
                >
                  {t(`rarity.${rarity}`)}
                </span>
              </div>
              <figcaption className="mt-1.5 text-right text-fine text-ink-faint">
                {t('speciesDetail.photoCredit', { credit: species.photo.credit, license: species.photo.license })}
              </figcaption>
            </figure>

            <h2 id={titleId} className="mt-3 text-title text-ink">
              {name}
            </h2>
            <p className="text-body text-ink-faint italic">{species.scientificName}</p>

            <div className="mt-3 flex flex-wrap gap-2 text-caption">
              <span className="rounded-full bg-surface-raised px-3 py-1 font-bold text-ink-muted ring-1 ring-line/60">
                {t(`speciesType.${species.type}`)}
              </span>
              {species.biome.map((b) => (
                <span key={b} className="rounded-full bg-surface-raised px-3 py-1 font-bold text-ink-muted ring-1 ring-line/60">
                  {t(`biome.${b}`)}
                </span>
              ))}
            </div>

            <p className="mt-4 text-body text-ink-muted">{speciesDescription(species, i18n.language)}</p>

            {firstEntry && (
              <section className="mt-5">
                <h3>
                  <Overline>{t('speciesDetail.history', { count: sortedEntries.length })}</Overline>
                </h3>
                <p className="mt-1 text-body text-ink-muted">
                  {t('speciesDetail.firstCollected', { date: formatDate(firstEntry.collectedAt) })}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {sortedEntries.map((entry, i) => (
                    <li
                      key={entry.id}
                      className="enter flex items-center gap-3 rounded-control bg-surface-sunken/70 px-3 py-2 text-caption"
                      style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                    >
                      <MethodIcon method={entry.method} />
                      <span className="flex-1 font-bold text-ink">
                        {t(`speciesDetail.method.${entry.method}`)}
                      </span>
                      <span className="text-ink-muted tabular-nums">
                        {formatDate(entry.collectedAt)} · {formatTime(entry.collectedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <Button size="lg" onClick={close} className="mt-5 shrink-0">
            {t('common.close')}
          </Button>
        </>
      )}
    </BottomSheet>
  )
}
