import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SPECIES_CATALOG } from '../domain/species'
import { useCollectionStore } from '../stores/collectionStore'

interface ManualSightingModalProps {
  onClose: () => void
}

export function ManualSightingModal({ onClose }: ManualSightingModalProps) {
  const { t } = useTranslation()
  const logManualSighting = useCollectionStore((s) => s.logManualSighting)
  const [saving, setSaving] = useState<string | null>(null)

  async function logSighting(speciesId: string) {
    setSaving(speciesId)
    await logManualSighting(speciesId)
    setSaving(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl bg-emerald-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-center text-lg font-semibold text-emerald-50">{t('manualSighting.title')}</h2>
        <p className="mb-4 text-center text-xs text-emerald-400">{t('manualSighting.subtitle')}</p>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {SPECIES_CATALOG.map((species) => {
            const name = t(`species.${species.id}.name`)
            return (
              <button
                key={species.id}
                disabled={saving !== null}
                onClick={() => void logSighting(species.id)}
                className="flex w-full items-center gap-3 rounded-xl bg-emerald-900/50 p-2 text-left active:bg-emerald-800"
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
        <button onClick={onClose} className="mt-4 text-sm text-emerald-300 underline underline-offset-4">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
