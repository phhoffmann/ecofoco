export function computeRemainingSeconds(startedAt: number, plannedDurationSeconds: number, now: number): number {
  const elapsed = Math.floor((now - startedAt) / 1000)
  return Math.max(0, plannedDurationSeconds - elapsed)
}
