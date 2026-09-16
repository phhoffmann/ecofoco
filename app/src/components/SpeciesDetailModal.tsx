import { useTranslation } from 'react-i18next'
import type { CollectedEntry } from '../domain/types'
import type { Species } from '../domain/species'

interface SpeciesDetailModalProps {
  species: Species
  entries: CollectedEntry[]
  onClose: () => void
}

export function SpeciesDetailModal({ species, entries, onClose }: SpeciesDetailModalProps) {
  const { t } = useTranslation()
  const sortedEntries = [...entries].sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
  const name = t(`species.${species.id}.name`)

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-emerald-950 p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto">
          <img src={species.image} alt={name} className="mx-auto size-32 rounded-2xl object-cover" />
          <h2 className="mt-4 text-xl font-semibold text-emerald-50">{name}</h2>
          <p className="text-sm italic text-emerald-400">{species.scientificName}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-800 px-3 py-1 text-emerald-100">
              {t(`rarity.${species.rarity}`)}
            </span>
            <span className="rounded-full bg-emerald-800 px-3 py-1 text-emerald-100">
              {t(`speciesType.${species.type}`)}
            </span>
            {species.biome.map((b) => (
              <span key={b} className="rounded-full bg-emerald-800 px-3 py-1 text-emerald-100">
                {t(`biome.${b}`)}
              </span>
            ))}
          </div>

          <p className="mt-4 text-left text-sm leading-relaxed text-emerald-200">
            {t(`species.${species.id}.description`)}
          </p>

          {sortedEntries.length > 0 && (
            <div className="mt-5 text-left">
              <p className="mb-2 text-xs font-medium tracking-wide text-emerald-500 uppercase">
                {t('speciesDetail.history', { count: sortedEntries.length })}
              </p>
              <ul className="space-y-1.5">
                {sortedEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg bg-emerald-900/50 px-3 py-2 text-xs"
                  >
                    <span className="text-emerald-100">
                      {new Date(entry.collectedAt).toLocaleDateString()}{' '}
                      {new Date(entry.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-emerald-400">{t(`speciesDetail.method.${entry.method}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {species.imageAttribution && (
            <p className="mt-4 text-[10px] text-emerald-600">
              {t('speciesDetail.photoCredit', { credit: species.imageAttribution })}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 shrink-0 rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}
