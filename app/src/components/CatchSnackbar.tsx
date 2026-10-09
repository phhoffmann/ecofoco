import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { speciesName } from '../domain/species'
import { useCelebrationStore } from '../stores/celebrationStore'
import { CloseIcon, UndoIcon } from './icons'

/** How long a snackbar stays before it slips away on its own. */
export const SNACKBAR_MS = 6000

/** A small note about a catch: in place of the reveal when celebrations are off, or after it to offer Undo. */
export function CatchSnackbar() {
  const { t, i18n } = useTranslation()
  const snackbar = useCelebrationStore((s) => s.snackbar)
  const revealOpen = useCelebrationStore((s) => s.reveal !== null)
  const dismissSnackbar = useCelebrationStore((s) => s.dismissSnackbar)
  const [undoing, setUndoing] = useState(false)

  useEffect(() => {
    if (!snackbar) return
    const timer = window.setTimeout(dismissSnackbar, SNACKBAR_MS)
    return () => window.clearTimeout(timer)
  }, [snackbar, dismissSnackbar])

  if (!snackbar || revealOpen) return null

  const { reveal, undo } = snackbar
  const name = speciesName(reveal.species, i18n.language)

  async function handleUndo() {
    if (!undo) return
    setUndoing(true)
    try {
      await undo()
    } finally {
      setUndoing(false)
      dismissSnackbar()
    }
  }

  return (
    <div
      key={snackbar.seq}
      role="status"
      className="snackbar-in flex w-full max-w-md items-center gap-2 rounded-card bg-surface-raised py-1.5 pr-1.5 pl-2 shadow-card ring-1 ring-line"
    >
      <img src={reveal.species.image} alt="" className="size-9 shrink-0 rounded-thumb object-cover" />
      <p className="min-w-0 flex-1 text-caption text-ink">
        <span className="font-bold">{t('snackbar.added', { name })}</span>
        <span className="text-ink-muted"> · {reveal.isNew ? t('celebration.new') : t('celebration.seen', { count: reveal.timesCollected })}</span>
      </p>
      {undo && (
        <button
          onClick={() => void handleUndo()}
          disabled={undoing}
          className="press inline-flex min-h-11 items-center gap-1 rounded-control px-3 text-caption font-extrabold text-accent active:bg-surface disabled:opacity-45"
        >
          <UndoIcon className="size-4" />
          {t('snackbar.undo')}
        </button>
      )}
      <button
        onClick={dismissSnackbar}
        aria-label={t('snackbar.dismiss')}
        className="press inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink-muted active:bg-surface"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  )
}
