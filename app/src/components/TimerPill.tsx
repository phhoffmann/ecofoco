import { useTranslation } from 'react-i18next'
import { formatClock } from '../domain/focusSession'
import { useFocusSessionStore } from '../stores/focusSessionStore'
import { useNavigationStore } from '../stores/navigationStore'
import { SproutIcon } from './icons'

/** The running session, kept in view on every other tab; tapping it goes back to Focus. */
export function TimerPill() {
  const { t } = useTranslation()
  const remainingSeconds = useFocusSessionStore((s) => s.remainingSeconds)
  const setTab = useNavigationStore((s) => s.setTab)
  const time = formatClock(remainingSeconds)

  return (
    <button
      onClick={() => setTab('focus')}
      aria-label={t('timerPill.label', { time })}
      className="press snackbar-in inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-caption font-extrabold text-on-accent shadow-lift"
    >
      <SproutIcon className="size-4" />
      <span className="tabular-nums">{time}</span>
      <span aria-hidden>· {t('timerPill.focusing')}</span>
    </button>
  )
}
