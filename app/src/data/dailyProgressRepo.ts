import { STEP_GOAL_POINTS } from '../domain/biome'
import type { DailyProgress } from '../domain/types'
import { getDb } from './db'
import { localDateKey } from './localDate'

export async function getTodayProgress(): Promise<DailyProgress> {
  const db = await getDb()
  const date = localDateKey()
  const res = await db.query('SELECT * FROM daily_progress WHERE date = ?', [date])
  const row = res.values?.[0]
  if (!row) return { date, steps: 0, goalMet: false, drawCompleted: false }
  return { date: row.date, steps: row.steps, goalMet: !!row.goalMet, drawCompleted: !!row.drawCompleted }
}

/**
 * Once a day's StepGoal is met it stays met: raising the goal later that day must not take back the
 * Draw or the Points the day already earned. A reading that changes nothing leaves the row as it was,
 * so it is not queued for sync again.
 */
export async function upsertTodaySteps(steps: number, stepGoal: number): Promise<DailyProgress> {
  const db = await getDb()
  const date = localDateKey()
  const goalMet = steps >= stepGoal
  await db.run(
    `INSERT INTO daily_progress (date, steps, goalMet, drawCompleted, points, updatedAt, pendingSync)
     VALUES (?, ?, ?, 0, ?, ?, 1)
     ON CONFLICT(date) DO UPDATE SET
       steps = excluded.steps,
       goalMet = MAX(goalMet, excluded.goalMet),
       -- The day earns its Points when the goal is first met, and keeps what it earned then.
       points = CASE WHEN goalMet = 0 THEN excluded.points ELSE points END,
       updatedAt = excluded.updatedAt,
       pendingSync = 1
     WHERE daily_progress.steps <> excluded.steps OR daily_progress.goalMet < excluded.goalMet`,
    [date, steps, goalMet ? 1 : 0, goalMet ? STEP_GOAL_POINTS : 0, new Date().toISOString()],
  )
  return getTodayProgress()
}

export async function markDrawCompleted(): Promise<void> {
  const db = await getDb()
  await db.run('UPDATE daily_progress SET drawCompleted = 1, updatedAt = ?, pendingSync = 1 WHERE date = ?', [
    new Date().toISOString(),
    localDateKey(),
  ])
}

/** Points earned by meeting the StepGoal, each day at the rate it was earned at. */
export async function sumStepGoalPoints(): Promise<number> {
  const db = await getDb()
  const res = await db.query('SELECT COALESCE(SUM(points), 0) AS points FROM daily_progress')
  return Number(res.values?.[0]?.points ?? 0)
}
