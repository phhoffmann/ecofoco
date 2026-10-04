import { useEffect, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { ARCHETYPE_SPRITES } from '../components/gardenSprites'
import { CheckIcon, FootprintsIcon, RefreshIcon, SparkleIcon } from '../components/icons'
import { RARITY_STYLES } from '../components/rarity'
import { Button, Card, EmptyState } from '../components/ui'
import { rarityIn, speciesName, type AnimalArchetype } from '../domain/species'
import { useActiveBiome } from '../stores/biomeStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useDailyProgressStore } from '../stores/dailyProgressStore'
import { useSettingsStore } from '../stores/settingsStore'

// Animals waiting at the end of the walk; they start hopping once the goal is met.
const WAITING_ANIMALS: AnimalArchetype[] = ['songbird', 'small-mammal', 'mid-mammal']

function SpriteArt({ archetype, className = '', style }: { archetype: AnimalArchetype; className?: string; style?: CSSProperties }) {
  return <img src={ARCHETYPE_SPRITES[archetype].src} alt="" draggable={false} className={`h-20 w-auto ${className}`} style={style} />
}

export function ActivityScreen() {
  const { t, i18n } = useTranslation()
  const stepGoal = useSettingsStore((s) => s.stepGoal)
  const biome = useActiveBiome()
  const {
    healthAvailable,
    authorized,
    progress,
    resultSpecies,
    loading,
    error,
    refresh,
    connect,
    draw,
    clearResult,
    simulateSteps,
  } = useDailyProgressStore()
  const refreshCollection = useCollectionStore((s) => s.refresh)
  const formatNumber = (n: number) => n.toLocaleString(i18n.language)

  // TODO: remove once the Activity flow is validated on-device — lets us hit the
  // step goal without actually walking 6,000 steps on every test cycle.
  const devSimulateButton = healthAvailable ? (
    <button onClick={() => void simulateSteps(stepGoal)} className="text-caption text-ink-faint underline underline-offset-4">
      {t('activity.simulateSteps', { count: stepGoal })}
    </button>
  ) : null

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (resultSpecies) {
    const tier = rarityIn(resultSpecies, biome)
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-gutter py-6">
        <p className="text-overline text-accent uppercase">{t('focus.youCollected')}</p>
        <img
          src={resultSpecies.image}
          alt={speciesName(resultSpecies, i18n.language)}
          className={`pop-in size-44 rounded-card object-cover shadow-card ring-4 ${RARITY_STYLES[tier].ring}`}
        />
        <p className="text-title text-ink">{speciesName(resultSpecies, i18n.language)}</p>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-overline ${RARITY_STYLES[tier].badge}`}>
          <SparkleIcon className="size-3" />
          {t(`rarity.${tier}`)}
        </span>
        <Button
          variant="primary"
          size="lg"
          className="w-full max-w-sm"
          onClick={() => {
            clearResult()
            void refreshCollection()
          }}
        >
          {t('common.done')}
        </Button>
      </div>
    )
  }

  if (healthAvailable === null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState art={<FootprintsIcon className="glow-pulse size-14 text-accent" />} title={t('activity.checkingHealthConnect')} />
      </div>
    )
  }

  if (!healthAvailable) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          art={<SpriteArt archetype="small-mammal" className="garden-bob" />}
          title={t('activity.unavailable')}
          body={t('activity.installHint')}
          action={
            <Button icon={RefreshIcon} onClick={() => void refresh()}>
              {t('common.tryAgain')}
            </Button>
          }
        />
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <EmptyState
          art={<SpriteArt archetype="songbird" className="garden-hop" />}
          title={t('activity.connectPrompt')}
          action={
            <div className="flex flex-col items-center gap-3">
              <Button variant="primary" size="lg" icon={FootprintsIcon} onClick={() => void connect()} disabled={loading}>
                {loading ? t('activity.connecting') : t('activity.connect')}
              </Button>
              {error && <p className="text-caption text-danger">{error}</p>}
              {devSimulateButton}
            </div>
          }
        />
      </div>
    )
  }

  const ratio = Math.min(1, progress.steps / stepGoal)

  return (
    <div className="flex flex-1 flex-col justify-center gap-4 px-gutter py-6">
      <Card className="enter overflow-hidden p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-overline text-ink-faint uppercase">{t('activity.todaySteps')}</p>
          {progress.goalMet && (
            <span className="pop-in inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-overline text-on-accent">
              <CheckIcon className="size-3" />
              {t('activity.goalMet')}
            </span>
          )}
        </div>
        <p className="mt-2 text-display tabular-nums text-ink">{formatNumber(progress.steps)}</p>
        <p className="mt-1 text-body text-ink-muted">{t('activity.ofGoal', { goal: formatNumber(stepGoal) })}</p>

        <div className="mt-8 flex items-end justify-end gap-1 pr-1" aria-hidden>
          {WAITING_ANIMALS.map((archetype, i) => (
            <SpriteArt
              key={archetype}
              archetype={archetype}
              className={`h-12 ${progress.goalMet ? 'garden-hop' : 'opacity-60 grayscale-[0.4]'}`}
              // Staggered so the three don't hop in unison.
              style={{ animationDuration: '2.6s', animationDelay: `${i * -0.7}s` }}
            />
          ))}
        </div>
        <div className="relative h-4 overflow-hidden rounded-full bg-surface-sunken ring-1 ring-line/60">
          <div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-accent to-accent-strong transition-[width] duration-700 ease-out-soft motion-reduce:transition-none"
            style={{ width: `${Math.max(ratio * 100, 4)}%` }}
          >
            <span aria-hidden className="progress-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
        </div>
      </Card>

      {progress.goalMet && !progress.drawCompleted && (
        <Button variant="primary" size="lg" icon={SparkleIcon} className="pop-in w-full" onClick={() => void draw()}>
          {t('activity.drawButton')}
        </Button>
      )}
      {progress.goalMet && progress.drawCompleted && (
        <p className="flex items-center justify-center gap-2 text-center text-body text-ink-muted">
          <CheckIcon className="size-5 shrink-0 text-accent" />
          {t('activity.drawDone')}
        </p>
      )}
      {!progress.goalMet && <p className="text-center text-body text-ink-muted">{t('activity.keepWalking')}</p>}

      <div className="flex flex-col items-center gap-2">
        <Button variant="ghost" size="sm" icon={RefreshIcon} onClick={() => void refresh()}>
          {t('activity.syncSteps')}
        </Button>
        {error && <p className="text-caption text-danger">{error}</p>}
        {devSimulateButton}
      </div>
    </div>
  )
}
