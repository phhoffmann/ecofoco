import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import type { CollectedEntry, CollectionMethod } from '../domain/types'
import { rarityIn, speciesDescription, speciesName, type Species } from '../domain/species'
import { useActiveBiome } from '../stores/biomeStore'
import { BottomSheet } from './BottomSheet'
import { RARITY_STYLES } from './rarity'

const METHOD_ICONS: Record<CollectionMethod, string> = {
  focus_session: '🌱',
  draw: '👟',
  manual_sighting: '👀',
  photo_ai: '📷',
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
              <div className="relative overflow-hidden rounded-2xl bg-emerald-900">
                <img src={species.image} alt={name} className="enter aspect-[4/3] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                <span
                  className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold shadow ${RARITY_STYLES[rarity].badge}`}
                >
                  {t(`rarity.${rarity}`)}
                </span>
              </div>
              <figcaption className="mt-1.5 text-right text-[10px] text-emerald-600">
                {t('speciesDetail.photoCredit', { credit: species.photo.credit, license: species.photo.license })}
              </figcaption>
            </figure>

            <h2 id={titleId} className="mt-3 text-2xl font-semibold text-emerald-50">
              {name}
            </h2>
            <p className="text-sm italic text-emerald-400">{species.scientificName}</p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-800 px-3 py-1 text-emerald-100">
                {t(`speciesType.${species.type}`)}
              </span>
              {species.biome.map((b) => (
                <span key={b} className="rounded-full bg-emerald-800 px-3 py-1 text-emerald-100">
                  {t(`biome.${b}`)}
                </span>
              ))}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-emerald-200">{speciesDescription(species, i18n.language)}</p>

            {firstEntry && (
              <section className="mt-5">
                <h3 className="text-xs font-medium tracking-wide text-emerald-500 uppercase">
                  {t('speciesDetail.history', { count: sortedEntries.length })}
                </h3>
                <p className="mt-1 text-sm text-emerald-200">
                  {t('speciesDetail.firstCollected', { date: formatDate(firstEntry.collectedAt) })}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {sortedEntries.map((entry, i) => (
                    <li
                      key={entry.id}
                      className="enter flex items-center gap-3 rounded-xl bg-emerald-900/50 px-3 py-2 text-xs"
                      style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                    >
                      <span aria-hidden className="text-base">
                        {METHOD_ICONS[entry.method]}
                      </span>
                      <span className="flex-1 font-medium text-emerald-100">
                        {t(`speciesDetail.method.${entry.method}`)}
                      </span>
                      <span className="text-emerald-400 tabular-nums">
                        {formatDate(entry.collectedAt)} · {formatTime(entry.collectedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <button
            onClick={close}
            className="press mt-5 shrink-0 rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
          >
            {t('common.close')}
          </button>
        </>
      )}
    </BottomSheet>
  )
}
