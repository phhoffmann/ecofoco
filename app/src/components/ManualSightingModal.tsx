import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SPECIES_CATALOG, speciesName, type Species } from '../domain/species'
import { useActiveBiome } from '../stores/biomeStore'
import { useCollectionStore } from '../stores/collectionStore'
import { BottomSheet } from './BottomSheet'
import { CheckIcon, EyeIcon, SearchIcon } from './icons'
import { Button } from './ui'

/** Lowercase without accents, so "ipe" finds "Ipê-amarelo". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

function matches(species: Species, query: string): boolean {
  if (!query) return true
  return [species.names.en, species.names['pt-BR'], species.scientificName].some((name) => normalize(name).includes(query))
}

interface ManualSightingModalProps {
  onClose: () => void
}

/** Pick a species of the Current Biome, confirm, and it's logged; the snackbar after the reveal offers Undo. */
export function ManualSightingModal({ onClose }: ManualSightingModalProps) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const logManualSighting = useCollectionStore((s) => s.logManualSighting)
  const entries = useCollectionStore((s) => s.entries)
  const biome = useActiveBiome()
  const [query, setQuery] = useState('')
  const [confirming, setConfirming] = useState<Species | null>(null)
  const [saving, setSaving] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const timesCollected = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of entries) counts.set(e.speciesId, (counts.get(e.speciesId) ?? 0) + 1)
    return counts
  }, [entries])
  const normalizedQuery = normalize(query.trim())
  const results = SPECIES_CATALOG.filter((s) => s.biome.includes(biome) && matches(s, normalizedQuery))

  // Keyboard and screen-reader focus follows the step.
  useEffect(() => {
    if (confirming) confirmRef.current?.focus()
  }, [confirming])

  async function confirm(close: () => void) {
    if (!confirming) return
    setSaving(true)
    try {
      await logManualSighting(confirming.id)
      close()
    } finally {
      setSaving(false)
    }
  }

  function back() {
    setConfirming(null)
    window.setTimeout(() => searchRef.current?.focus())
  }

  function collectedChip(speciesId: string) {
    const count = timesCollected.get(speciesId)
    if (!count) return null
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-overline text-accent">
        <CheckIcon className="size-3" />
        {t('manualSighting.collectedTimes', { count })}
      </span>
    )
  }

  return (
    <BottomSheet onClose={onClose} labelledBy={titleId}>
      {(close) =>
        confirming ? (
          <>
            <h2 id={titleId} className="mb-4 text-center text-title text-ink">
              {t('manualSighting.confirmTitle')}
            </h2>
            <div className="enter flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto text-center">
              <img src={confirming.image} alt="" className="size-32 rounded-card object-cover shadow-card" />
              <p className="text-title text-ink">{speciesName(confirming, i18n.language)}</p>
              <p className="text-body text-ink-faint italic">{confirming.scientificName}</p>
              {collectedChip(confirming.id)}
              <p className="mt-2 max-w-80 text-caption text-ink-muted">{t('manualSighting.confirmBody')}</p>
            </div>
            <div className="mt-4 flex shrink-0 flex-col gap-2">
              <Button ref={confirmRef} variant="primary" size="lg" icon={EyeIcon} disabled={saving} onClick={() => void confirm(close)}>
                {t('manualSighting.confirm')}
              </Button>
              <Button variant="ghost" disabled={saving} onClick={back}>
                {t('manualSighting.back')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id={titleId} className="mb-1 text-center text-title text-ink">
              {t('manualSighting.title')}
            </h2>
            <p className="mx-auto mb-3 max-w-80 text-center text-caption text-ink-muted">{t('manualSighting.subtitle')}</p>
            <label className="mb-3 flex min-h-11 shrink-0 items-center gap-2 rounded-control bg-surface-sunken px-3 ring-1 ring-line/60 focus-within:ring-2 focus-within:ring-accent">
              <SearchIcon className="size-4 shrink-0 text-ink-faint" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t('manualSighting.search')}
                placeholder={t('manualSighting.searchPlaceholder')}
                className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-faint"
              />
            </label>
            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
              {results.map((species) => {
                const name = speciesName(species, i18n.language)
                return (
                  <li key={species.id}>
                    <button
                      onClick={() => setConfirming(species)}
                      className="press flex w-full items-center gap-3 rounded-control bg-surface-sunken/70 p-2 text-left ring-1 ring-line/40 active:bg-surface-raised"
                    >
                      <img src={species.image} alt="" className="size-12 shrink-0 rounded-[0.625rem] object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body font-bold text-ink">{name}</p>
                        <p className="text-caption text-ink-faint">{t(`speciesType.${species.type}`)}</p>
                      </div>
                      {collectedChip(species.id)}
                    </button>
                  </li>
                )
              })}
            </ul>
            {results.length === 0 && (
              <p role="status" className="flex-1 py-6 text-center text-body text-ink-muted">
                {t('manualSighting.noResults', { query: query.trim() })}
              </p>
            )}
            <Button variant="ghost" onClick={close} className="mt-3 shrink-0">
              {t('common.cancel')}
            </Button>
          </>
        )
      }
    </BottomSheet>
  )
}
