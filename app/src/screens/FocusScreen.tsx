import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SparkleIcon, TimerIcon } from '../components/icons'
import { RARITY_STYLES } from '../components/rarity'
import { Sprout } from '../components/Sprout'
import { Button, Card } from '../components/ui'
import { growthStage } from '../domain/growth'
import { rarityIn, speciesName } from '../domain/species'
import { useActiveBiome } from '../stores/biomeStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useFocusSessionStore } from '../stores/focusSessionStore'

// TODO: remove the 3-minute option once manual on-device testing is done.
const DURATIONS_MINUTES = [3, 15, 25, 45]

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function FocusScreen() {
  const { t, i18n } = useTranslation()
  const { status, plannedDurationSeconds, remainingSeconds, growingArchetype, resultSpecies, start, fail, reset } =
    useFocusSessionStore()
  const refreshCollection = useCollectionStore((s) => s.refresh)
  const biome = useActiveBiome()

  useEffect(() => {
    if (status === 'completed') void refreshCollection()
  }, [status, refreshCollection])

  if (status === 'idle') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-gutter py-6">
        <Sprout progress={0} archetype={null} biome={biome} />
        <div className="space-y-1 text-center">
          <h1 className="text-title text-ink">{t('focus.chooseDuration')}</h1>
          <p className="mx-auto max-w-72 text-body text-ink-muted">{t('focus.idleHint')}</p>
        </div>
        <div className="grid w-full max-w-sm grid-cols-4 gap-2">
          {DURATIONS_MINUTES.map((min, i) => (
            <button
              key={min}
              onClick={() => start(min * 60)}
              className="press enter flex flex-col items-center gap-1 rounded-card bg-surface py-3 font-extrabold text-ink shadow-card ring-1 ring-line/60 active:bg-accent active:text-on-accent"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <TimerIcon className="size-4 text-accent" />
              {t('focus.durationMinutes', { count: min })}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (status === 'running') {
    const progress = 1 - remainingSeconds / plannedDurationSeconds
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-gutter py-6">
        <Sprout progress={progress} archetype={growingArchetype} biome={biome} />
        <div className="text-center">
          <p className="text-display tabular-nums text-ink">{formatTime(remainingSeconds)}</p>
          <p key={growthStage(progress)} className="pop-in mt-2 text-overline text-accent uppercase">
            {t(`focus.stages.${growthStage(progress)}`)}
          </p>
        </div>
        <p className="max-w-80 text-center text-caption text-ink-muted">{t('focus.leaveWarning')}</p>
        <Button variant="danger" size="sm" onClick={() => void fail()}>
          {t('focus.giveUp')}
        </Button>
      </div>
    )
  }

  if (status === 'completed') {
    const tier = resultSpecies ? rarityIn(resultSpecies, biome) : null
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-gutter py-6">
        <Sprout progress={1} archetype={growingArchetype} biome={biome} mood="grown" />
        {resultSpecies && tier && (
          <Card className="enter flex w-full max-w-sm items-center gap-4">
            <img
              src={resultSpecies.image}
              alt={speciesName(resultSpecies, i18n.language)}
              className={`size-16 shrink-0 rounded-control object-cover ring-2 ${RARITY_STYLES[tier].ring}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-caption text-ink-muted">{t('focus.grewInto')}</p>
              <p className="truncate text-title text-ink">{speciesName(resultSpecies, i18n.language)}</p>
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-overline ${RARITY_STYLES[tier].badge}`}>
                <SparkleIcon className="size-3" />
                {t(`rarity.${tier}`)}
              </span>
            </div>
          </Card>
        )}
        <Button variant="primary" size="lg" className="w-full max-w-sm" onClick={reset}>
          {t('common.done')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-gutter py-6">
      <Sprout progress={0} archetype={null} biome={biome} mood="wilted" />
      <div className="space-y-1 text-center">
        <h1 className="text-title text-danger">{t('focus.sessionFailed')}</h1>
        <p className="mx-auto max-w-72 text-body text-ink-muted">{t('focus.leftEarly')}</p>
      </div>
      <Button variant="primary" size="lg" className="w-full max-w-sm" onClick={reset}>
        {t('common.tryAgain')}
      </Button>
    </div>
  )
}
