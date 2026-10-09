export function computeRemainingSeconds(startedAt: number, plannedDurationSeconds: number, now: number): number {
  const elapsed = Math.floor((now - startedAt) / 1000)
  return Math.max(0, plannedDurationSeconds - elapsed)
}

/** Time a user may spend in other apps before the session fails — covers the notification shade and accidental switches. */
export const LEAVE_GRACE_MS = 5_000

export function hasLeftTooLong(otherAppMs: number): boolean {
  return otherAppMs > LEAVE_GRACE_MS
}

/** m:ss, e.g. 24:05. */
export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
