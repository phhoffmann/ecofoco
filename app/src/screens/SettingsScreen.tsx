import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LOCALES, type Locale } from '../i18n/locale'
import { useSettingsStore } from '../stores/settingsStore'

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português',
}

const STEP_GOAL_INCREMENT = 500
const STEP_GOAL_MIN = 1000

export function SettingsScreen() {
  const { t } = useTranslation()
  const { notificationsEnabled, language, stepGoal, loaded, load, setNotificationsEnabled, setLanguage, setStepGoal } =
    useSettingsStore()

  useEffect(() => {
    void load()
  }, [load])

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-emerald-300">{t('settings.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 px-6 py-6">
      <div className="flex items-center justify-between rounded-xl bg-emerald-900/50 px-4 py-3">
        <div>
          <p className="font-medium text-emerald-50">{t('settings.notifications')}</p>
          <p className="text-xs text-emerald-400">{t('settings.notificationsHint')}</p>
        </div>
        <button
          role="switch"
          aria-checked={notificationsEnabled}
          onClick={() => void setNotificationsEnabled(!notificationsEnabled)}
          className={`h-7 w-12 shrink-0 rounded-full transition-colors ${
            notificationsEnabled ? 'bg-emerald-500' : 'bg-emerald-800'
          }`}
        >
          <span
            className={`block size-5 rounded-full bg-emerald-50 transition-transform ${
              notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="rounded-xl bg-emerald-900/50 px-4 py-3">
        <p className="mb-3 font-medium text-emerald-50">{t('settings.language')}</p>
        <div className="flex gap-2">
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale}
              onClick={() => void setLanguage(locale)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                language === locale ? 'bg-emerald-500 text-emerald-950' : 'bg-emerald-800 text-emerald-100'
              }`}
            >
              {LANGUAGE_LABELS[locale]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-emerald-900/50 px-4 py-3">
        <p className="font-medium text-emerald-50">{t('settings.stepGoal')}</p>
        <p className="mb-3 text-xs text-emerald-400">{t('settings.stepGoalHint')}</p>
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => void setStepGoal(Math.max(STEP_GOAL_MIN, stepGoal - STEP_GOAL_INCREMENT))}
            className="size-9 rounded-lg bg-emerald-800 font-semibold text-emerald-100 active:bg-emerald-700"
          >
            −
          </button>
          <p className="text-lg font-semibold tabular-nums text-emerald-50">
            {t('settings.stepGoalValue', { count: stepGoal })}
          </p>
          <button
            onClick={() => void setStepGoal(stepGoal + STEP_GOAL_INCREMENT)}
            className="size-9 rounded-lg bg-emerald-800 font-semibold text-emerald-100 active:bg-emerald-700"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
