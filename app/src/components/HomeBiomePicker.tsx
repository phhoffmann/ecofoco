import { useTranslation } from 'react-i18next'
import { BIOME_IDS, hasCatalog, type BiomeId } from '../domain/biome'
import type { DetectResult } from '../stores/biomeStore'
import { BiomeSwatch } from './BiomeSwatch'

const PLAYABLE_BIOMES = BIOME_IDS.filter((b) => hasCatalog(b))

interface HomeBiomePickerProps {
  disabled?: boolean
  onPick: (biome: BiomeId) => void
}

/** Manual home Biome choice: the fallback when location is denied, unavailable, or unsupported. */
export function HomeBiomePicker({ disabled, onPick }: HomeBiomePickerProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-2">
      {PLAYABLE_BIOMES.map((biome, i) => (
        <button
          key={biome}
          disabled={disabled}
          onClick={() => onPick(biome)}
          className="press enter flex min-h-11 items-center gap-2.5 rounded-control bg-surface p-2.5 text-left text-caption font-bold text-ink shadow-card ring-1 ring-line/60 active:bg-surface-raised disabled:opacity-50"
          style={{ animationDelay: `${i * 35}ms` }}
        >
          <BiomeSwatch biome={biome} className="w-8" />
          {t(`biome.${biome}`)}
        </button>
      ))}
    </div>
  )
}

export function DetectResultMessage({ result }: { result: DetectResult }) {
  const { t } = useTranslation()
  const biome = 'biome' in result ? t(`biome.${result.biome}`) : undefined
  return <p className="pop-in text-body text-ink-muted">{t(`biomeSetup.result.${result.outcome}`, { biome })}</p>
}
