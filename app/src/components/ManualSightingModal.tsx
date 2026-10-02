import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SPECIES_CATALOG } from '../domain/species'
import { useCollectionStore } from '../stores/collectionStore'
import { BottomSheet } from './BottomSheet'

interface ManualSightingModalProps {
  onClose: () => void
}

export function ManualSightingModal({ onClose }: ManualSightingModalProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const logManualSighting = useCollectionStore((s) => s.logManualSighting)
  const [saving, setSaving] = useState<string | null>(null)

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
          <h2 id={titleId} className="mb-1 text-center text-lg font-semibold text-emerald-50">
            {t('manualSighting.title')}
          </h2>
          <p className="mb-4 text-center text-xs text-emerald-400">{t('manualSighting.subtitle')}</p>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
            {SPECIES_CATALOG.map((species) => {
              const name = t(`species.${species.id}.name`)
              return (
                <button
                  key={species.id}
                  disabled={saving !== null}
                  onClick={() => void logSighting(species.id, close)}
                  className="press flex w-full items-center gap-3 rounded-xl bg-emerald-900/50 p-2 text-left active:bg-emerald-800"
                >
                  <img src={species.image} alt={name} className="size-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium text-emerald-50">{name}</p>
                    <p className="text-xs text-emerald-400">{t(`speciesType.${species.type}`)}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <button onClick={close} className="mt-4 shrink-0 text-sm text-emerald-300 underline underline-offset-4">
            {t('common.cancel')}
          </button>
        </>
      )}
    </BottomSheet>
  )
}
