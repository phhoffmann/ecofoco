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
import { BiomeSwatch } from './BiomeSwatch'
import { DetectResultMessage, HomeBiomePicker } from './HomeBiomePicker'
import { CheckIcon, LockIcon, MapPinIcon, SparkleIcon } from './icons'
import { Button, Card, CardHeader } from './ui'

function BiomeAction({ biome, progress }: { biome: BiomeId; progress: BiomeProgress }) {
  const { t } = useTranslation()
  const unlock = useBiomeStore((s) => s.unlock)
  const switchTo = useBiomeStore((s) => s.switchTo)

  switch (biomeStatus(biome, progress)) {
    case 'current':
      return (
        <span className="inline-flex items-center gap-1 text-caption font-bold text-accent">
          <CheckIcon className="size-4" />
          {t('settings.biome.current')}
        </span>
      )
    case 'unlocked':
      return (
        <Button variant="primary" size="sm" onClick={() => void switchTo(biome)}>
          {t('settings.biome.switch')}
        </Button>
      )
    case 'unlockable':
      return (
        <Button size="sm" disabled={progress.balance < NEIGHBOUR_UNLOCK_COST} onClick={() => void unlock(biome)}>
          {t('settings.biome.unlock', { cost: NEIGHBOUR_UNLOCK_COST })}
        </Button>
      )
    case 'locked':
      return (
        <span className="inline-flex items-center gap-1 text-caption text-ink-faint">
          <LockIcon className="size-3.5" />
          {t('settings.biome.locked')}
        </span>
      )
    case 'coming-soon':
      return <span className="text-caption text-ink-faint">{t('settings.biome.comingSoon')}</span>
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
    <Card className="enter space-y-3">
      <CardHeader
        icon={MapPinIcon}
        title={t('settings.biome.title')}
        hint={t('settings.biome.hint')}
        trailing={
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-caption font-extrabold tabular-nums text-accent">
            <SparkleIcon className="size-3.5" />
            {t('settings.biome.points', { count: progress.balance })}
          </span>
        }
      />
      <p className="text-caption text-ink-faint">
        {t('settings.biome.pointsHint', {
          session: FOCUS_SESSION_POINTS,
          goal: STEP_GOAL_POINTS,
          cost: NEIGHBOUR_UNLOCK_COST,
        })}
      </p>

      <ul className="space-y-1.5">
        {BIOME_IDS.map((biome) => {
          const current = biome === progress.current
          return (
            <li
              key={biome}
              className={`flex min-h-12 items-center gap-3 rounded-control px-2.5 py-1.5 transition-colors ${
                current ? 'bg-accent/12 ring-1 ring-accent/50' : 'bg-surface-sunken/70'
              }`}
            >
              <BiomeSwatch biome={biome} className="w-8" />
              <span className="min-w-0 flex-1 text-body font-bold text-ink">
                {t(`biome.${biome}`)}
                {biome === progress.home && (
                  <span className="ml-2 text-caption font-semibold text-ink-faint">· {t('settings.biome.home')}</span>
                )}
              </span>
              <BiomeAction biome={biome} progress={progress} />
            </li>
          )
        })}
      </ul>

      <button
        onClick={() => void redetect()}
        disabled={detecting}
        className="press inline-flex min-h-11 items-center gap-1.5 text-caption font-bold text-accent disabled:opacity-50"
      >
        <MapPinIcon className="size-4" />
        {detecting ? t('biomeSetup.detecting') : t('settings.biome.redetect')}
      </button>
      {result?.outcome === 'unavailable' && <p className="text-caption text-ink-muted">{t('settings.biome.redetectUnavailable')}</p>}
      {result && result.outcome !== 'unavailable' && (
        <div className="space-y-2">
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
    </Card>
  )
}
