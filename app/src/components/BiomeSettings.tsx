import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import {
  BIOME_IDS,
  FOCUS_SESSION_POINTS,
  NEIGHBOUR_UNLOCK_COST,
  STEP_GOAL_POINTS,
  biomeStatus,
  type BiomeId,
  type BiomeProgress,
} from '../domain/biome'
import { selectBiomeProgress, useBiomeStore, type DetectResult } from '../stores/biomeStore'
import { DetectResultMessage, HomeBiomePicker } from './HomeBiomePicker'

const actionClass = 'rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-40'

function BiomeAction({ biome, progress }: { biome: BiomeId; progress: BiomeProgress }) {
  const { t } = useTranslation()
  const unlock = useBiomeStore((s) => s.unlock)
  const switchTo = useBiomeStore((s) => s.switchTo)

  switch (biomeStatus(biome, progress)) {
    case 'current':
      return <span className="text-xs font-medium text-emerald-300">{t('settings.biome.current')}</span>
    case 'unlocked':
      return (
        <button onClick={() => void switchTo(biome)} className={`${actionClass} bg-emerald-500 text-emerald-950`}>
          {t('settings.biome.switch')}
        </button>
      )
    case 'unlockable':
      return (
        <button
          disabled={progress.balance < NEIGHBOUR_UNLOCK_COST}
          onClick={() => void unlock(biome)}
          className={`${actionClass} bg-emerald-800 text-emerald-100`}
        >
          {t('settings.biome.unlock', { cost: NEIGHBOUR_UNLOCK_COST })}
        </button>
      )
    case 'locked':
      return <span className="text-xs text-emerald-500">{t('settings.biome.locked')}</span>
    case 'coming-soon':
      return <span className="text-xs text-emerald-600">{t('settings.biome.comingSoon')}</span>
  }
}

/** Current Biome, point balance, neighbour unlocks, switching, and re-detecting the home Biome. */
export function BiomeSettings() {
  const { t } = useTranslation()
  const load = useBiomeStore((s) => s.load)
  const detectHome = useBiomeStore((s) => s.detectHome)
  const setHome = useBiomeStore((s) => s.setHome)
  const progress = useBiomeStore(useShallow(selectBiomeProgress))
  const [detecting, setDetecting] = useState(false)
  const [result, setResult] = useState<DetectResult | null>(null)

  // Reload on open so the balance reflects sessions and step goals completed since app start.
  useEffect(() => {
    void load()
  }, [load])

  if (!progress) return null

  async function redetect() {
    setDetecting(true)
    setResult(await detectHome())
    setDetecting(false)
  }

  return (
    <div className="rounded-xl bg-emerald-900/50 px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium text-emerald-50">{t('settings.biome.title')}</p>
        <p className="text-sm font-semibold tabular-nums text-emerald-50">
          {t('settings.biome.points', { count: progress.balance })}
        </p>
      </div>
      <p className="text-xs text-emerald-400">{t('settings.biome.hint')}</p>
      <p className="mb-3 text-xs text-emerald-400">
        {t('settings.biome.pointsHint', {
          session: FOCUS_SESSION_POINTS,
          goal: STEP_GOAL_POINTS,
          cost: NEIGHBOUR_UNLOCK_COST,
        })}
      </p>

      <ul className="space-y-1.5">
        {BIOME_IDS.map((biome) => (
          <li key={biome} className="flex min-h-9 items-center justify-between gap-3 rounded-lg bg-emerald-950/40 px-3 py-1.5">
            <span className="text-sm text-emerald-100">
              {t(`biome.${biome}`)}
              {biome === progress.home && (
                <span className="ml-2 text-xs text-emerald-400">· {t('settings.biome.home')}</span>
              )}
            </span>
            <BiomeAction biome={biome} progress={progress} />
          </li>
        ))}
      </ul>

      <button
        onClick={() => void redetect()}
        disabled={detecting}
        className="mt-3 text-sm text-emerald-300 underline underline-offset-4 disabled:opacity-50"
      >
        {detecting ? t('biomeSetup.detecting') : t('settings.biome.redetect')}
      </button>
      {result && (
        <div className="mt-2 space-y-2">
          <DetectResultMessage result={result} />
          {result.outcome !== 'detected' && (
            <HomeBiomePicker
              onPick={(biome) => {
                void setHome(biome)
                setResult(null)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
