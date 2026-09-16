import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollectionStore } from '../stores/collectionStore'
import { useDailyProgressStore } from '../stores/dailyProgressStore'
import { useSettingsStore } from '../stores/settingsStore'

export function ActivityScreen() {
  const { t } = useTranslation()
  const stepGoal = useSettingsStore((s) => s.stepGoal)
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

  // TODO: remove once the Activity flow is validated on-device — lets us hit the
  // step goal without actually walking 6,000 steps on every test cycle.
  const devSimulateButton = healthAvailable ? (
    <button
      onClick={() => void simulateSteps(stepGoal)}
      className="text-xs text-emerald-500 underline underline-offset-4"
    >
      {t('activity.simulateSteps', { count: stepGoal })}
    </button>
  ) : null

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (resultSpecies) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <p className="text-emerald-200">{t('focus.youCollected')}</p>
        <img
          src={resultSpecies.image}
          alt={t(`species.${resultSpecies.id}.name`)}
          className="size-40 rounded-2xl object-cover"
        />
        <p className="text-2xl font-semibold text-emerald-50">{t(`species.${resultSpecies.id}.name`)}</p>
        <p className="text-sm text-emerald-400">{t(`rarity.${resultSpecies.rarity}`)}</p>
        <button
          onClick={() => {
            clearResult()
            void refreshCollection()
          }}
          className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
        >
          {t('common.done')}
        </button>
      </div>
    )
  }

  if (healthAvailable === null) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-emerald-300">{t('activity.checkingHealthConnect')}</p>
      </div>
    )
  }

  if (!healthAvailable) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-emerald-200">{t('activity.unavailable')}</p>
        <p className="text-sm text-emerald-400">{t('activity.installHint')}</p>
        <button
          onClick={() => void refresh()}
          className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
        >
          {t('common.tryAgain')}
        </button>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-emerald-200">{t('activity.connectPrompt')}</p>
        <button
          onClick={() => void connect()}
          disabled={loading}
          className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
        >
          {loading ? t('activity.connecting') : t('activity.connect')}
        </button>
        {error && <p className="text-sm text-red-300">{error}</p>}
        {devSimulateButton}
      </div>
    )
  }

  const percent = Math.min(100, Math.round((progress.steps / stepGoal) * 100))

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <p className="text-emerald-200">{t('activity.todaySteps')}</p>
      <p className="text-4xl font-semibold tabular-nums text-emerald-50">
        {progress.steps} <span className="text-lg text-emerald-400">/ {stepGoal}</span>
      </p>
      <div className="h-3 w-full max-w-64 overflow-hidden rounded-full bg-emerald-900">
        <div className="h-full bg-emerald-400" style={{ width: `${percent}%` }} />
      </div>

      {progress.goalMet && !progress.drawCompleted && (
        <button
          onClick={() => void draw()}
          className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
        >
          {t('activity.drawButton')}
        </button>
      )}
      {progress.goalMet && progress.drawCompleted && (
        <p className="text-sm text-emerald-400">{t('activity.drawDone')}</p>
      )}
      {!progress.goalMet && <p className="text-sm text-emerald-400">{t('activity.keepWalking')}</p>}

      <button onClick={() => void refresh()} className="text-sm text-emerald-300 underline underline-offset-4">
        {t('activity.syncSteps')}
      </button>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {devSimulateButton}
    </div>
  )
}
