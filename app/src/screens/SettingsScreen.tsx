import { useEffect, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { BiomeSettings } from '../components/BiomeSettings'
import { CreditsSheet } from '../components/CreditsSheet'
import { BookIcon, FootprintsIcon, GlobeIcon, MinusIcon, PlusIcon, SparkleIcon } from '../components/icons'
import { Card, CardHeader, EmptyState, IconButton, SegmentedControl, SettingRow, Switch } from '../components/ui'
import type { MotionPreference } from '../domain/types'
import { SUPPORTED_LOCALES, type Locale } from '../i18n/locale'
import { useSettingsStore } from '../stores/settingsStore'

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português',
}

const STEP_GOAL_INCREMENT = 500
const STEP_GOAL_MIN = 1000
const MOTION_OPTIONS: MotionPreference[] = ['system', 'reduce', 'full']

/** Toggles only where users genuinely disagree; each starts from a sensible default. */
function DisplaySettings({ style }: { style?: CSSProperties }) {
  const { t } = useTranslation()
  const display = useSettingsStore((s) => s.display)
  const setDisplay = useSettingsStore((s) => s.setDisplay)

  return (
    <Card className="enter space-y-4" style={style}>
      <CardHeader icon={SparkleIcon} title={t('settings.display.title')} />
      <SettingRow
        title={t('settings.display.celebrations')}
        hint={t('settings.display.celebrationsHint')}
        control={({ describedBy }) => (
          <Switch
            checked={display.celebrations}
            onChange={(on) => void setDisplay('celebrations', on)}
            label={t('settings.display.celebrations')}
            describedBy={describedBy}
          />
        )}
      />
      <SettingRow
        title={t('settings.display.haptics')}
        hint={t('settings.display.hapticsHint')}
        control={({ describedBy }) => (
          <Switch
            checked={display.haptics}
            onChange={(on) => void setDisplay('haptics', on)}
            label={t('settings.display.haptics')}
            describedBy={describedBy}
          />
        )}
      />
      <SettingRow
        title={t('settings.display.timerPill')}
        hint={t('settings.display.timerPillHint')}
        control={({ describedBy }) => (
          <Switch
            checked={display.timerPill}
            onChange={(on) => void setDisplay('timerPill', on)}
            label={t('settings.display.timerPill')}
            describedBy={describedBy}
          />
        )}
      />
      <div className="space-y-2">
        <div>
          <p className="text-body font-bold text-ink">{t('settings.display.motion')}</p>
          <p className="text-caption text-ink-faint">{t('settings.display.motionHint')}</p>
        </div>
        <SegmentedControl<MotionPreference>
          label={t('settings.display.motion')}
          value={display.motion}
          onChange={(motion) => void setDisplay('motion', motion)}
          options={MOTION_OPTIONS.map((value) => ({ value, label: t(`settings.display.motionOptions.${value}`) }))}
        />
      </div>
    </Card>
  )
}

export function SettingsScreen() {
  const { t, i18n } = useTranslation()
  const { language, stepGoal, loaded, load, setLanguage, setStepGoal } = useSettingsStore()
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

      <Card className="enter space-y-3" style={{ animationDelay: '40ms' }}>
        <CardHeader icon={GlobeIcon} title={t('settings.language')} />
        <SegmentedControl<Locale>
          label={t('settings.language')}
          value={language}
          onChange={(locale) => void setLanguage(locale)}
          options={SUPPORTED_LOCALES.map((locale) => ({ value: locale, label: LANGUAGE_LABELS[locale] }))}
        />
      </Card>

      <Card className="enter space-y-3" style={{ animationDelay: '80ms' }}>
        <CardHeader icon={FootprintsIcon} title={t('settings.stepGoal')} hint={t('settings.stepGoalHint')} />
        <div className="flex items-center justify-between gap-3 rounded-control bg-surface-sunken p-1.5">
          <IconButton
            icon={MinusIcon}
            label={t('settings.stepGoalDecrease')}
            onClick={() => void setStepGoal(Math.max(STEP_GOAL_MIN, stepGoal - STEP_GOAL_INCREMENT))}
          />
          <p key={stepGoal} className="pop-in text-title tabular-nums text-ink">
            {t('settings.stepGoalValue', { value: stepGoal.toLocaleString(i18n.language) })}
          </p>
          <IconButton icon={PlusIcon} label={t('settings.stepGoalIncrease')} onClick={() => void setStepGoal(stepGoal + STEP_GOAL_INCREMENT)} />
        </div>
      </Card>

      <DisplaySettings style={{ animationDelay: '120ms' }} />

      <div className="enter flex items-start gap-3 px-1 pt-2 text-fine text-ink-faint" style={{ animationDelay: '160ms' }}>
        <BookIcon className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-bold">{t('settings.credits.title')}</p>
          <p>{t('settings.credits.biomeMap')}</p>
          <p>{t('settings.credits.speciesSummary')}</p>
          <button onClick={() => setShowCredits(true)} className="min-h-11 font-bold text-accent underline underline-offset-2">
            {t('settings.credits.open')}
          </button>
        </div>
      </div>
      {showCredits && <CreditsSheet onClose={() => setShowCredits(false)} />}
    </div>
  )
}
