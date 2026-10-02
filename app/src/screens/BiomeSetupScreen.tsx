import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DetectResultMessage, HomeBiomePicker } from '../components/HomeBiomePicker'
import { useBiomeStore, type DetectResult } from '../stores/biomeStore'

/** First-run onboarding: finds the home Biome from coarse location, or lets the user pick it. */
export function BiomeSetupScreen() {
  const { t } = useTranslation()
  const detectHome = useBiomeStore((s) => s.detectHome)
  const setHome = useBiomeStore((s) => s.setHome)
  const [detecting, setDetecting] = useState(false)
  const [result, setResult] = useState<DetectResult | null>(null)

  async function detect() {
    setDetecting(true)
    setResult(await detectHome())
    setDetecting(false)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-emerald-50">{t('biomeSetup.title')}</h1>
        <p className="text-sm text-emerald-300">{t('biomeSetup.subtitle')}</p>
      </div>
      <button
        onClick={() => void detect()}
        disabled={detecting}
        className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-emerald-950 active:bg-emerald-400 disabled:opacity-60"
      >
        {detecting ? t('biomeSetup.detecting') : t('biomeSetup.useLocation')}
      </button>
      {result && <DetectResultMessage result={result} />}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs text-emerald-400">{t('biomeSetup.pick')}</p>
        <HomeBiomePicker disabled={detecting} onPick={(biome) => void setHome(biome)} />
      </div>
    </div>
  )
}
