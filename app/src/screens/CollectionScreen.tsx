import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CollectionGarden } from '../components/CollectionGarden'
import { ARCHETYPE_SPRITES } from '../components/gardenSprites'
import { EyeIcon, GardenIcon, GridIcon } from '../components/icons'
import { ManualSightingModal } from '../components/ManualSightingModal'
import { SpeciesDetailSheet } from '../components/SpeciesDetailSheet'
import { Button, EmptyState, SegmentedControl } from '../components/ui'
import { SPECIES_CATALOG, collectedCatalogSpeciesIds, speciesName } from '../domain/species'
import type { CollectionView } from '../domain/types'
import { useActiveBiome } from '../stores/biomeStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useSettingsStore } from '../stores/settingsStore'

export function CollectionScreen() {
  const { t, i18n } = useTranslation()
  const { entries, loaded, refresh } = useCollectionStore()
  const collectionView = useSettingsStore((s) => s.collectionView)
  const setCollectionView = useSettingsStore((s) => s.setCollectionView)
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null)
  const [showManualSighting, setShowManualSighting] = useState(false)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const biome = useActiveBiome()
  const biomeSpecies = SPECIES_CATALOG.filter((s) => s.biome.includes(biome))
  const collectedSpeciesIds = collectedCatalogSpeciesIds(entries, biomeSpecies)
  const selectedSpecies = SPECIES_CATALOG.find((s) => s.id === selectedSpeciesId) ?? null
  const discovered = biomeSpecies.length ? collectedSpeciesIds.size / biomeSpecies.length : 0

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
          <p className="text-overline text-ink-faint uppercase">{t(`biome.${biome}`)}</p>
          <p className="text-body font-bold text-ink">
            {t('collection.discovered', { count: collectedSpeciesIds.size, total: biomeSpecies.length })}
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
        <div className="grid grid-cols-3 gap-2.5">
          {biomeSpecies.map((species, i) => {
            const isCollected = collectedSpeciesIds.has(species.id)
            const name = speciesName(species, i18n.language)
            return (
              <button
                key={species.id}
                disabled={!isCollected}
                onClick={() => setSelectedSpeciesId(species.id)}
                className={`press enter flex flex-col items-center gap-1.5 rounded-card p-2 pb-2.5 text-center disabled:cursor-default ${
                  isCollected ? 'bg-surface shadow-card ring-1 ring-line/60 active:bg-surface-raised' : 'bg-surface-sunken/70 ring-1 ring-line/30'
                }`}
                style={{ animationDelay: `${Math.min(i, 12) * 20}ms` }}
              >
                {isCollected ? (
                  <img src={species.image} alt={name} className="aspect-square w-full rounded-[calc(var(--radius-card)-6px)] object-cover" />
                ) : (
                  // Undiscovered: the archetype's silhouette, so the grid hints at what's still out there.
                  <span className="flex aspect-square w-full items-center justify-center rounded-[calc(var(--radius-card)-6px)] bg-surface/60">
                    <span
                      aria-hidden
                      className="size-3/4 bg-line"
                      style={{
                        maskImage: `url(${ARCHETYPE_SPRITES[species.archetype].src})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                      }}
                    />
                  </span>
                )}
                <span className={`line-clamp-2 text-caption leading-tight ${isCollected ? 'font-bold text-ink' : 'text-ink-faint'}`}>
                  {isCollected ? name : t('collection.unknown')}
                </span>
              </button>
            )
          })}
        </div>
      )}
      {collectionView === 'grid' && loaded && collectedSpeciesIds.size === 0 && (
        <EmptyState
          art={<img src={ARCHETYPE_SPRITES.shrub.src} alt="" className="garden-rustle h-20 w-auto origin-bottom" />}
          title={t('collection.empty')}
        />
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
