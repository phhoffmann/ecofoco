import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SPECIES_CATALOG, speciesName } from '../domain/species'
import { useActiveBiome } from '../stores/biomeStore'
import { useCollectionStore } from '../stores/collectionStore'
import { BottomSheet } from './BottomSheet'
import { Button } from './ui'

interface ManualSightingModalProps {
  onClose: () => void
}

export function ManualSightingModal({ onClose }: ManualSightingModalProps) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const logManualSighting = useCollectionStore((s) => s.logManualSighting)
  const [saving, setSaving] = useState<string | null>(null)
  const biome = useActiveBiome()

  async function logSighting(speciesId: string, close: () => void) {
    setSaving(speciesId)
    await logManualSighting(speciesId)
    setSaving(null)
    close()
  }

  return (
    <BottomSheet onClose={onClose} labelledBy={titleId}>
      {(close) => (
        <>
          <h2 id={titleId} className="mb-1 text-center text-title text-ink">
            {t('manualSighting.title')}
          </h2>
          <p className="mx-auto mb-4 max-w-80 text-center text-caption text-ink-muted">{t('manualSighting.subtitle')}</p>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
            {SPECIES_CATALOG.filter((s) => s.biome.includes(biome)).map((species) => {
              const name = speciesName(species, i18n.language)
              return (
                <button
                  key={species.id}
                  disabled={saving !== null}
                  onClick={() => void logSighting(species.id, close)}
                  className="press enter flex w-full items-center gap-3 rounded-control bg-surface-sunken/70 p-2 text-left ring-1 ring-line/40 active:bg-surface-raised"
                >
                  <img src={species.image} alt={name} className="size-12 rounded-[0.625rem] object-cover" />
                  <div>
                    <p className="text-body font-bold text-ink">{name}</p>
                    <p className="text-caption text-ink-faint">{t(`speciesType.${species.type}`)}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <Button variant="ghost" onClick={close} className="mt-3 shrink-0">
            {t('common.cancel')}
          </Button>
        </>
      )}
    </BottomSheet>
  )
}
