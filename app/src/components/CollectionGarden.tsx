import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GARDEN_PERIODS,
  entriesInRange,
  isInRange,
  periodRange,
  shiftPeriod,
  type DateRange,
  type GardenPeriod,
} from '../domain/period'
import { SPECIES_CATALOG } from '../domain/species'
import type { CollectedEntry } from '../domain/types'
import { IsometricGarden } from './IsometricGarden'

const SPECIES_TYPE_BY_ID = new Map(SPECIES_CATALOG.map((s) => [s.id, s.type]))

function formatRange(period: GardenPeriod, range: DateRange, locale: string): string {
  switch (period) {
    case 'day':
      return range.start.toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    case 'week': {
      const lastDay = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate() - 1)
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).formatRange(range.start, lastDay)
    }
    case 'month':
      return range.start.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  }
}

interface CollectionGardenProps {
  entries: CollectedEntry[]
  onSelectSpecies: (speciesId: string) => void
}

/** Forest-style garden of what was collected in one day / week / month. */
export function CollectionGarden({ entries, onSelectSpecies }: CollectionGardenProps) {
  const { t, i18n } = useTranslation()
  const [period, setPeriod] = useState<GardenPeriod>('day')
  const [anchor, setAnchor] = useState(() => new Date())

  const range = periodRange(period, anchor)
  const isCurrentPeriod = isInRange(new Date(), range)
  const periodEntries = useMemo(() => entriesInRange(entries, periodRange(period, anchor)), [entries, period, anchor])
  const plants = periodEntries.filter((e) => SPECIES_TYPE_BY_ID.get(e.speciesId) === 'plant').length
  const animals = periodEntries.filter((e) => SPECIES_TYPE_BY_ID.get(e.speciesId) === 'animal').length

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {GARDEN_PERIODS.map((p) => (
          <button
            key={p}
            aria-pressed={period === p}
            onClick={() => {
              setPeriod(p)
              setAnchor(new Date())
            }}
            className={`press flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
              period === p ? 'bg-emerald-500 text-emerald-950' : 'bg-emerald-800 text-emerald-100'
            }`}
          >
            {t(`collection.garden.periods.${p}`)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          aria-label={t('collection.garden.previous')}
          onClick={() => setAnchor(shiftPeriod(period, anchor, -1))}
          className="press size-9 rounded-lg bg-emerald-800 font-semibold text-emerald-100 active:bg-emerald-700"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="font-medium text-emerald-50">{formatRange(period, range, i18n.language)}</p>
          <p className="text-xs text-emerald-400">
            {t('collection.garden.plants', { count: plants })} · {t('collection.garden.animals', { count: animals })}
          </p>
        </div>
        <button
          aria-label={t('collection.garden.next')}
          disabled={isCurrentPeriod}
          onClick={() => setAnchor(shiftPeriod(period, anchor, 1))}
          className="press size-9 rounded-lg bg-emerald-800 font-semibold text-emerald-100 active:bg-emerald-700 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <IsometricGarden entries={periodEntries} onSelectSpecies={onSelectSpecies} />

      {plants + animals === 0 && (
        <p className="text-center text-sm text-emerald-400">{t('collection.garden.empty')}</p>
      )}
    </div>
  )
}
