import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Sprout } from '../components/Sprout'
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
  const { t } = useTranslation()
  const { status, plannedDurationSeconds, remainingSeconds, resultSpecies, start, fail, reset } =
    useFocusSessionStore()
  const refreshCollection = useCollectionStore((s) => s.refresh)

  useEffect(() => {
    if (status === 'completed') void refreshCollection()
  }, [status, refreshCollection])

  if (status === 'idle') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <p className="text-emerald-200">{t('focus.chooseDuration')}</p>
        <div className="flex gap-3">
          {DURATIONS_MINUTES.map((min) => (
            <button
              key={min}
              onClick={() => start(min * 60)}
              className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
            >
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
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <Sprout progress={progress} />
        <p className="text-4xl font-semibold tabular-nums text-emerald-50">{formatTime(remainingSeconds)}</p>
        <p className="text-center text-sm text-emerald-300">{t('focus.leaveWarning')}</p>
        <button onClick={() => void fail()} className="text-sm text-red-300 underline underline-offset-4">
          {t('focus.giveUp')}
        </button>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <p className="text-emerald-200">{t('focus.youCollected')}</p>
        {resultSpecies && (
          <>
            <img
              src={resultSpecies.image}
              alt={t(`species.${resultSpecies.id}.name`)}
              className="size-40 rounded-2xl object-cover"
            />
            <p className="text-2xl font-semibold text-emerald-50">{t(`species.${resultSpecies.id}.name`)}</p>
            <p className="text-sm text-emerald-400">{t(`rarity.${resultSpecies.rarity}`)}</p>
          </>
        )}
        <button
          onClick={reset}
          className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
        >
          {t('common.done')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <p className="text-xl font-medium text-red-300">{t('focus.sessionFailed')}</p>
      <p className="text-center text-sm text-emerald-300">{t('focus.leftEarly')}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
      >
        {t('common.tryAgain')}
      </button>
    </div>
  )
}
