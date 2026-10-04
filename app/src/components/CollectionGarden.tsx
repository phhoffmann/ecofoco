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
import type { BiomeId } from '../domain/biome'
import { SPECIES_CATALOG } from '../domain/species'
import type { CollectedEntry } from '../domain/types'
import { ChevronLeftIcon, ChevronRightIcon, LeafIcon, PawIcon } from './icons'
import { IsometricGarden } from './IsometricGarden'
import { Card, IconButton, SegmentedControl } from './ui'

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
  biome: BiomeId
  onSelectSpecies: (speciesId: string) => void
}

/** Forest-style garden of what was collected in one day / week / month. */
export function CollectionGarden({ entries, biome, onSelectSpecies }: CollectionGardenProps) {
  const { t, i18n } = useTranslation()
  const [period, setPeriod] = useState<GardenPeriod>('day')
  const [anchor, setAnchor] = useState(() => new Date())

  const range = periodRange(period, anchor)
  const isCurrentPeriod = isInRange(new Date(), range)
  const periodEntries = useMemo(() => entriesInRange(entries, periodRange(period, anchor)), [entries, period, anchor])
  const plants = periodEntries.filter((e) => SPECIES_TYPE_BY_ID.get(e.speciesId) === 'plant').length
  const animals = periodEntries.filter((e) => SPECIES_TYPE_BY_ID.get(e.speciesId) === 'animal').length

  return (
    <Card className="space-y-3 p-3">
      <SegmentedControl<GardenPeriod>
        label={t('collection.garden.periodLabel')}
        value={period}
        onChange={(p) => {
          setPeriod(p)
          setAnchor(new Date())
        }}
        options={GARDEN_PERIODS.map((p) => ({ value: p, label: t(`collection.garden.periods.${p}`) }))}
      />

      <div className="flex items-center justify-between gap-2">
        <IconButton
          icon={ChevronLeftIcon}
          label={t('collection.garden.previous')}
          onClick={() => setAnchor(shiftPeriod(period, anchor, -1))}
        />
        <div key={range.start.toISOString()} className="enter text-center">
          <p className="text-body font-extrabold text-ink">{formatRange(period, range, i18n.language)}</p>
          <p className="flex items-center justify-center gap-2 text-caption text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <LeafIcon className="size-3.5 text-accent" />
              {t('collection.garden.plants', { count: plants })}
            </span>
            <span className="inline-flex items-center gap-1">
              <PawIcon className="size-3.5 text-accent" />
              {t('collection.garden.animals', { count: animals })}
            </span>
          </p>
        </div>
        <IconButton
          icon={ChevronRightIcon}
          label={t('collection.garden.next')}
          disabled={isCurrentPeriod}
          onClick={() => setAnchor(shiftPeriod(period, anchor, 1))}
        />
      </div>

      <IsometricGarden
        entries={periodEntries}
        biome={biome}
        onSelectSpecies={onSelectSpecies}
        transitionKey={`${period}:${range.start.toISOString()}`}
      />

      {plants + animals === 0 && <p className="pb-2 text-center text-caption text-ink-muted">{t('collection.garden.empty')}</p>}
    </Card>
  )
}
