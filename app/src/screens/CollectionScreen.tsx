import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CollectionGarden } from '../components/CollectionGarden'
import { ARCHETYPE_SPRITES } from '../components/gardenSprites'
import { EyeIcon, GardenIcon, GridIcon } from '../components/icons'
import { ManualSightingModal } from '../components/ManualSightingModal'
import { SpeciesDetailSheet } from '../components/SpeciesDetailSheet'
import { Button, EmptyState, Overline, SegmentedControl } from '../components/ui'
import { isMotionReduced } from '../data/motion'
import {
  collectedBySpecies,
  speciesById,
  speciesName,
  speciesOfBiome,
  type CollectedSummary,
  type Species,
  type SpeciesKind,
} from '../domain/species'
import type { CollectionView } from '../domain/types'
import { useActiveBiome } from '../stores/biomeStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useSettingsStore } from '../stores/settingsStore'

type KindFilter = 'all' | SpeciesKind

/** Collected species first, most recently collected on top; undiscovered ones after, in catalog order. */
function sortForGrid(species: Species[], collected: Map<string, CollectedSummary>): Species[] {
  return [...species].sort((a, b) => {
    const ca = collected.get(a.id)
    const cb = collected.get(b.id)
    if (ca && cb) return cb.latest.localeCompare(ca.latest)
    return Number(!!cb) - Number(!!ca)
  })
}

export function CollectionScreen() {
  const { t, i18n } = useTranslation()
  const { entries, loaded, refresh, clearHighlight } = useCollectionStore()
  const pendingHighlight = useCollectionStore((s) => s.highlightSpeciesId)
  const collectionView = useSettingsStore((s) => s.collectionView)
  const setCollectionView = useSettingsStore((s) => s.setCollectionView)
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null)
  const [showManualSighting, setShowManualSighting] = useState(false)
  const [kind, setKind] = useState<KindFilter>('all')
  // The latest catch stays highlighted for this visit; the store forgets it once it's been seen here.
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const gridRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Only the grid shows the highlight, so the garden leaves it pending for when the grid is opened.
  const showsHighlight = collectionView === 'grid'
  if (showsHighlight && pendingHighlight && pendingHighlight !== highlightId) setHighlightId(pendingHighlight)
  useEffect(() => {
    if (showsHighlight && pendingHighlight) clearHighlight()
  }, [showsHighlight, pendingHighlight, clearHighlight])

  const biome = useActiveBiome()
  const biomeSpecies = useMemo(() => speciesOfBiome(biome), [biome])
  const collected = useMemo(() => collectedBySpecies(entries), [entries])
  const collectedCount = biomeSpecies.filter((s) => collected.has(s.id)).length
  const shown = sortForGrid(
    biomeSpecies.filter((s) => kind === 'all' || s.type === kind),
    collected,
  )
  const selectedSpecies = (selectedSpeciesId && speciesById(selectedSpeciesId)) || null
  const discovered = biomeSpecies.length ? collectedCount / biomeSpecies.length : 0

  // Bring the latest catch into view.
  useEffect(() => {
    if (!highlightId || !showsHighlight) return
    const tile = gridRef.current?.querySelector(`[data-species-id="${highlightId}"]`)
    tile?.scrollIntoView?.({ block: 'center', behavior: isMotionReduced() ? 'auto' : 'smooth' })
  }, [highlightId, showsHighlight, kind, loaded])

  return (
    <div className="space-y-4 px-gutter py-4">
      <SegmentedControl<CollectionView>
        label={t('collection.view.label')}
        value={collectionView}
        onChange={(view) => void setCollectionView(view)}
        options={[
          { value: 'grid', label: t('collection.view.grid'), icon: GridIcon },
          { value: 'isometric', label: t('collection.view.isometric'), icon: GardenIcon },
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <Overline>{t(`biome.${biome}`)}</Overline>
          <p className="text-body font-bold text-ink">
            {t('collection.discovered', { count: collectedCount, total: biomeSpecies.length })}
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out-soft motion-reduce:transition-none"
              style={{ width: `${discovered * 100}%` }}
            />
          </div>
        </div>
        <Button size="sm" icon={EyeIcon} onClick={() => setShowManualSighting(true)}>
          {t('collection.logSighting')}
        </Button>
      </div>

      {collectionView === 'isometric' ? (
        <CollectionGarden entries={entries} biome={biome} onSelectSpecies={setSelectedSpeciesId} />
      ) : (
        <>
          {loaded && collectedCount === 0 && (
            <EmptyState
              className="py-4"
              art={<img src={ARCHETYPE_SPRITES.shrub.src} alt="" className="garden-rustle h-20 w-auto origin-bottom" />}
              title={t('collection.empty')}
            />
          )}

          <SegmentedControl<KindFilter>
            label={t('collection.filter.label')}
            value={kind}
            onChange={setKind}
            options={[
              { value: 'all', label: t('collection.filter.all') },
              { value: 'plant', label: t('collection.filter.plant') },
              { value: 'animal', label: t('collection.filter.animal') },
            ]}
          />

          <ul ref={gridRef} className="grid grid-cols-3 gap-2.5">
            {shown.map((species, i) => {
              const mine = collected.get(species.id)
              const name = speciesName(species, i18n.language)
              const highlighted = mine !== undefined && species.id === highlightId
              const tileShape = 'press enter flex w-full flex-col items-center gap-1.5 rounded-card p-2 pb-2.5 text-center'
              const delay = { animationDelay: `${Math.min(i, 12) * 20}ms` }
              return (
                <li key={species.id}>
                  {mine ? (
                    <button
                      data-species-id={species.id}
                      aria-label={t('collection.tileCollected', { name, count: mine.count })}
                      onClick={() => setSelectedSpeciesId(species.id)}
                      className={`${tileShape} bg-surface shadow-card ring-1 ring-line/60 active:bg-surface-raised ${
                        highlighted ? 'catch-highlight ring-2 ring-accent' : ''
                      }`}
                      style={delay}
                    >
                      <span className="relative block w-full">
                        <img src={species.image} alt="" className="aspect-square w-full rounded-tile object-cover" />
                        {highlighted && mine.count === 1 && (
                          <span className="absolute top-1 left-1 rounded-full bg-accent px-2 py-0.5 text-overline text-on-accent uppercase">
                            {t('collection.newBadge')}
                          </span>
                        )}
                        {mine.count > 1 && (
                          <span className="absolute top-1 right-1 rounded-full bg-canvas/85 px-2 py-0.5 text-overline text-ink tabular-nums">
                            {t('collection.timesBadge', { count: mine.count })}
                          </span>
                        )}
                      </span>
                      <span className="line-clamp-2 text-caption leading-tight font-bold text-ink">{name}</span>
                    </button>
                  ) : (
                    // Undiscovered: the archetype's silhouette, so the grid hints at what's still out there.
                    <div
                      role="img"
                      aria-label={t(`collection.tileUndiscovered.${species.type}`)}
                      className={`${tileShape} bg-surface-sunken/70 ring-1 ring-line/30`}
                      style={delay}
                    >
                      <span aria-hidden className="flex aspect-square w-full items-center justify-center rounded-tile bg-surface/60">
                        <span
                          className="size-3/4 bg-line"
                          style={{
                            maskImage: `url(${ARCHETYPE_SPRITES[species.archetype].src})`,
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                          }}
                        />
                      </span>
                      <span aria-hidden className="line-clamp-2 text-caption leading-tight text-ink-faint">
                        {t('collection.unknown')}
                      </span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}

      {selectedSpecies && (
        <SpeciesDetailSheet
          species={selectedSpecies}
          entries={entries.filter((e) => e.speciesId === selectedSpecies.id)}
          onClose={() => setSelectedSpeciesId(null)}
        />
      )}
      {showManualSighting && <ManualSightingModal onClose={() => setShowManualSighting(false)} />}
    </div>
  )
}
