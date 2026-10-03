import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CollectionGarden } from '../components/CollectionGarden'
import { ManualSightingModal } from '../components/ManualSightingModal'
import { SpeciesDetailSheet } from '../components/SpeciesDetailSheet'
import { SPECIES_CATALOG, collectedCatalogSpeciesIds } from '../domain/species'
import type { CollectionView } from '../domain/types'
import { useActiveBiome } from '../stores/biomeStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useSettingsStore } from '../stores/settingsStore'

const COLLECTION_VIEWS: CollectionView[] = ['grid', 'isometric']

export function CollectionScreen() {
  const { t } = useTranslation()
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

  return (
    <div className="px-4 py-6">
      <div role="group" aria-label={t('collection.view.label')} className="mb-4 flex rounded-xl bg-emerald-900/60 p-1">
        {COLLECTION_VIEWS.map((view) => (
          <button
            key={view}
            aria-pressed={collectionView === view}
            onClick={() => void setCollectionView(view)}
            className={`press flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
              collectionView === view ? 'bg-emerald-500 text-emerald-950 shadow' : 'text-emerald-200'
            }`}
          >
            {t(`collection.view.${view}`)}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-400">{t(`biome.${biome}`)}</p>
          <p className="text-emerald-200">
            {t('collection.discovered', { count: collectedSpeciesIds.size, total: biomeSpecies.length })}
          </p>
        </div>
        <button
          onClick={() => setShowManualSighting(true)}
          className="press rounded-lg bg-emerald-800 px-3 py-1.5 text-sm font-medium text-emerald-50 active:bg-emerald-700"
        >
          {t('collection.logSighting')}
        </button>
      </div>
      {collectionView === 'isometric' ? (
        <CollectionGarden entries={entries} biome={biome} onSelectSpecies={setSelectedSpeciesId} />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {biomeSpecies.map((species, i) => {
            const isCollected = collectedSpeciesIds.has(species.id)
            const name = t(`species.${species.id}.name`)
            return (
              <button
                key={species.id}
                disabled={!isCollected}
                onClick={() => setSelectedSpeciesId(species.id)}
                className="press enter flex flex-col items-center gap-1 rounded-xl bg-emerald-900/50 p-2 text-center active:bg-emerald-800/70 disabled:cursor-default"
                style={{ animationDelay: `${Math.min(i, 12) * 20}ms` }}
              >
                <img
                  src={species.image}
                  alt={name}
                  className={`size-16 rounded-lg object-cover ${isCollected ? '' : 'brightness-0'}`}
                />
                <span className="text-xs text-emerald-100">{isCollected ? name : t('collection.unknown')}</span>
              </button>
            )
          })}
        </div>
      )}
      {collectionView === 'grid' && loaded && collectedSpeciesIds.size === 0 && (
        <p className="mt-8 text-center text-sm text-emerald-400">{t('collection.empty')}</p>
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
