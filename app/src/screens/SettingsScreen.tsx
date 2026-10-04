import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BiomeSettings } from '../components/BiomeSettings'
import { CreditsSheet } from '../components/CreditsSheet'
import { BellIcon, BookIcon, FootprintsIcon, GlobeIcon, MinusIcon, PlusIcon } from '../components/icons'
import { Card, CardHeader, EmptyState, IconButton, SegmentedControl } from '../components/ui'
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
  const {
    notificationsEnabled,
    language,
    stepGoal,
    loaded,
    load,
    setNotificationsEnabled,
    setLanguage,
    setStepGoal,
  } = useSettingsStore()
  const [showCredits, setShowCredits] = useState(false)

  useEffect(() => {
    void load()
  }, [load])

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState art={<GlobeIcon className="glow-pulse size-12 text-accent" />} title={t('settings.loading')} />
      </div>
    )
  }

  return (
    <div className="space-y-3 px-gutter py-4">
      <BiomeSettings />

      <Card className="enter" style={{ animationDelay: '40ms' }}>
        <CardHeader
          icon={BellIcon}
          title={t('settings.notifications')}
          hint={t('settings.notificationsHint')}
          trailing={
            <button
              role="switch"
              aria-checked={notificationsEnabled}
              aria-label={t('settings.notifications')}
              onClick={() => void setNotificationsEnabled(!notificationsEnabled)}
              className={`press relative h-7 w-12 shrink-0 self-center rounded-full ring-1 transition-colors ${
                notificationsEnabled ? 'bg-accent ring-accent' : 'bg-surface-sunken ring-line'
              }`}
            >
              <span
                className={`block size-5 rounded-full bg-ink shadow transition-transform duration-300 ease-spring motion-reduce:transition-none ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          }
        />
      </Card>

      <Card className="enter space-y-3" style={{ animationDelay: '80ms' }}>
        <CardHeader icon={GlobeIcon} title={t('settings.language')} />
        <SegmentedControl<Locale>
          label={t('settings.language')}
          value={language}
          onChange={(locale) => void setLanguage(locale)}
          options={SUPPORTED_LOCALES.map((locale) => ({ value: locale, label: LANGUAGE_LABELS[locale] }))}
        />
      </Card>

      <Card className="enter space-y-3" style={{ animationDelay: '120ms' }}>
        <CardHeader icon={FootprintsIcon} title={t('settings.stepGoal')} hint={t('settings.stepGoalHint')} />
        <div className="flex items-center justify-between gap-3 rounded-control bg-surface-sunken p-1.5">
          <IconButton
            icon={MinusIcon}
            label={t('settings.stepGoalDecrease')}
            onClick={() => void setStepGoal(Math.max(STEP_GOAL_MIN, stepGoal - STEP_GOAL_INCREMENT))}
          />
          <p key={stepGoal} className="pop-in text-title tabular-nums text-ink">
            {t('settings.stepGoalValue', { count: stepGoal })}
          </p>
          <IconButton icon={PlusIcon} label={t('settings.stepGoalIncrease')} onClick={() => void setStepGoal(stepGoal + STEP_GOAL_INCREMENT)} />
        </div>
      </Card>

      <div className="enter flex items-start gap-3 px-1 pt-2 text-[10px] leading-snug text-ink-faint" style={{ animationDelay: '160ms' }}>
        <BookIcon className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-bold">{t('settings.credits.title')}</p>
          <p>{t('settings.credits.biomeMap')}</p>
          <p>{t('settings.credits.speciesSummary')}</p>
          <button onClick={() => setShowCredits(true)} className="mt-1 font-bold text-accent underline underline-offset-2">
            {t('settings.credits.open')}
          </button>
        </div>
      </div>
      {showCredits && <CreditsSheet onClose={() => setShowCredits(false)} />}
    </div>
  )
}
