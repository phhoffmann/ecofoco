import { useTranslation } from 'react-i18next'
import { BIOME_IDS, hasCatalog, type BiomeId } from '../domain/biome'
import type { DetectResult } from '../stores/biomeStore'

const PLAYABLE_BIOMES = BIOME_IDS.filter((b) => hasCatalog(b))

interface HomeBiomePickerProps {
  disabled?: boolean
  onPick: (biome: BiomeId) => void
}

/** Manual home Biome choice: the fallback when location is denied, unavailable, or unsupported. */
export function HomeBiomePicker({ disabled, onPick }: HomeBiomePickerProps) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2">
      {PLAYABLE_BIOMES.map((biome) => (
        <button
          key={biome}
          disabled={disabled}
          onClick={() => onPick(biome)}
          className="flex-1 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-medium text-emerald-100 active:bg-emerald-700 disabled:opacity-50"
        >
          {t(`biome.${biome}`)}
        </button>
      ))}
    </div>
  )
}

export function DetectResultMessage({ result }: { result: DetectResult }) {
  const { t } = useTranslation()
  const biome = 'biome' in result ? t(`biome.${result.biome}`) : undefined
  return <p className="text-sm text-emerald-200">{t(`biomeSetup.result.${result.outcome}`, { biome })}</p>
}
