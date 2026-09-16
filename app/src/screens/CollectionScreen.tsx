import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ManualSightingModal } from '../components/ManualSightingModal'
import { SpeciesDetailModal } from '../components/SpeciesDetailModal'
import { SPECIES_CATALOG } from '../domain/species'
import { useCollectionStore } from '../stores/collectionStore'

export function CollectionScreen() {
  const { t } = useTranslation()
  const { entries, loaded, refresh } = useCollectionStore()
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null)
  const [showManualSighting, setShowManualSighting] = useState(false)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const collectedSpeciesIds = new Set(entries.map((e) => e.speciesId))
  const selectedSpecies = SPECIES_CATALOG.find((s) => s.id === selectedSpeciesId) ?? null

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-emerald-200">
          {t('collection.discovered', { count: collectedSpeciesIds.size, total: SPECIES_CATALOG.length })}
        </p>
        <button
          onClick={() => setShowManualSighting(true)}
          className="rounded-lg bg-emerald-800 px-3 py-1.5 text-sm font-medium text-emerald-50 active:bg-emerald-700"
        >
          {t('collection.logSighting')}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {SPECIES_CATALOG.map((species) => {
          const isCollected = collectedSpeciesIds.has(species.id)
          const name = t(`species.${species.id}.name`)
          return (
            <button
              key={species.id}
              disabled={!isCollected}
              onClick={() => setSelectedSpeciesId(species.id)}
              className="flex flex-col items-center gap-1 rounded-xl bg-emerald-900/50 p-2 text-center disabled:cursor-default"
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
      {loaded && entries.length === 0 && (
        <p className="mt-8 text-center text-sm text-emerald-400">{t('collection.empty')}</p>
      )}

      {selectedSpecies && (
        <SpeciesDetailModal
          species={selectedSpecies}
          entries={entries.filter((e) => e.speciesId === selectedSpecies.id)}
          onClose={() => setSelectedSpeciesId(null)}
        />
      )}
      {showManualSighting && <ManualSightingModal onClose={() => setShowManualSighting(false)} />}
    </div>
  )
}
