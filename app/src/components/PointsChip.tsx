import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { selectPointBalance, useBiomeStore } from '../stores/biomeStore'
import { useNavigationStore } from '../stores/navigationStore'
import { SparkleIcon } from './icons'

/** The point balance, always in the header; tapping it opens Settings. */
export function PointsChip() {
  const { t } = useTranslation()
  const balance = useBiomeStore(selectPointBalance)
  const setTab = useNavigationStore((s) => s.setTab)
  // Counts changes since mount, so the number bumps when points are earned or spent but not on launch.
  const [shown, setShown] = useState(balance)
  const [changes, setChanges] = useState(0)
  if (balance !== shown) {
    setShown(balance)
    setChanges((n) => n + 1)
  }

  return (
    <button
      onClick={() => setTab('settings')}
      aria-label={t('pointsChip.label', { count: balance })}
      // A 44px tap target around a compact chip; the negative margin keeps the header its height.
      className="press -my-1.5 inline-flex min-h-11 shrink-0 items-center"
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-caption font-extrabold tabular-nums text-accent ring-1 ring-accent/30">
        <SparkleIcon className="size-3.5" />
        <span key={changes} aria-hidden className={changes > 0 ? 'points-bump' : undefined}>
          {balance}
        </span>
      </span>
    </button>
  )
}
