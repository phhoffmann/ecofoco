import { useTranslation } from 'react-i18next'
import { TimerIcon } from '../components/icons'
import { Sprout } from '../components/Sprout'
import { sproutRingSize } from '../components/sproutRing'
import { Button, HoldButton } from '../components/ui'
import { useViewportHeight } from '../components/useViewportHeight'
import { formatClock } from '../domain/focusSession'
import { growthStage } from '../domain/growth'
import { speciesName } from '../domain/species'
import { useActiveBiome } from '../stores/biomeStore'
import { useFocusSessionStore } from '../stores/focusSessionStore'

// TODO: remove the 3-minute option once manual on-device testing is done.
const DURATIONS_MINUTES = [3, 15, 25, 45]

// Tighter spacing on short screens, so the controls stay above the nav at 360×640.
const LAYOUT = 'flex flex-1 flex-col items-center justify-center gap-4 px-gutter py-4 [@media(min-height:720px)]:gap-6 [@media(min-height:720px)]:py-6'

export function FocusScreen() {
  const { t, i18n } = useTranslation()
  const { status, plannedDurationSeconds, remainingSeconds, growingArchetype, resultSpecies, failReason, start, fail, reset } =
    useFocusSessionStore()
  const biome = useActiveBiome()
  const ringSize = sproutRingSize(useViewportHeight())

  if (status === 'idle') {
    return (
      <div className={LAYOUT}>
        <Sprout progress={0} archetype={null} biome={biome} size={ringSize} />
        <div className="space-y-1 text-center">
          <h1 className="text-title text-ink">{t('focus.chooseDuration')}</h1>
          <p className="mx-auto max-w-72 text-body text-ink-muted">{t('focus.idleHint')}</p>
        </div>
        <div className="grid w-full max-w-sm grid-cols-4 gap-2">
          {DURATIONS_MINUTES.map((min, i) => (
            <button
              key={min}
              onClick={() => void start(min * 60)}
              className="press enter flex min-h-14 flex-col items-center justify-center gap-1 rounded-card bg-surface py-2.5 font-extrabold text-ink shadow-card ring-1 ring-line/60 active:bg-accent active:text-on-accent"
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
      <div className={LAYOUT}>
        <Sprout progress={progress} archetype={growingArchetype} biome={biome} size={ringSize} />
        <div className="text-center">
          <p role="timer" className="text-display tabular-nums text-ink">
            {formatClock(remainingSeconds)}
          </p>
          {/* The visible clock changes every second; screen readers hear the minutes instead. */}
          <p className="sr-only" aria-live="polite">
            {t('focus.minutesLeft', { count: Math.ceil(remainingSeconds / 60) })}
          </p>
          <p key={growthStage(progress)} className="pop-in mt-2 text-overline text-accent uppercase">
            {t(`focus.stages.${growthStage(progress)}`)}
          </p>
        </div>
        <p className="max-w-80 text-center text-caption text-ink-muted">{t('focus.leaveWarning')}</p>
        <HoldButton onConfirm={() => void fail('gave_up')}>{t('focus.holdToGiveUp')}</HoldButton>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className={LAYOUT}>
        <Sprout progress={1} archetype={growingArchetype} biome={biome} mood="grown" size={ringSize} />
        {resultSpecies && (
          <p className="enter max-w-80 text-center text-body font-bold text-ink">
            {t('focus.joinedCollection', { name: speciesName(resultSpecies, i18n.language) })}
          </p>
        )}
        <Button variant="primary" size="lg" className="w-full max-w-sm" onClick={reset}>
          {t('focus.plantAnother')}
        </Button>
      </div>
    )
  }

  // A failed Sprout is gone: the ring stays, empty.
  const reason = failReason ?? 'left_app'
  return (
    <div className={LAYOUT}>
      <Sprout progress={0} archetype={null} biome={biome} mood="gone" size={ringSize} />
      <div className="space-y-1 text-center" role="status">
        <h1 className="text-title text-danger">{t(`focus.failed.${reason}.title`)}</h1>
        <p className="mx-auto max-w-80 text-body text-ink-muted">{t(`focus.failed.${reason}.body`)}</p>
      </div>
      <Button variant="primary" size="lg" className="w-full max-w-sm" onClick={reset}>
        {t('common.tryAgain')}
      </Button>
    </div>
  )
}
