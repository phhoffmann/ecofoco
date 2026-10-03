export function computeRemainingSeconds(startedAt: number, plannedDurationSeconds: number, now: number): number {
  const elapsed = Math.floor((now - startedAt) / 1000)
  return Math.max(0, plannedDurationSeconds - elapsed)
}

/** Time a user may spend in other apps before the session fails — covers the notification shade and accidental switches. */
export const LEAVE_GRACE_MS = 5_000

export function hasLeftTooLong(otherAppMs: number): boolean {
  return otherAppMs > LEAVE_GRACE_MS
}
