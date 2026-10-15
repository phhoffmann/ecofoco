import type { DailyProgress } from './types'

export function canDraw(progress: DailyProgress): boolean {
  return progress.goalMet && !progress.drawCompleted
}
