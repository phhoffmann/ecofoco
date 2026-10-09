import type { DailyProgress } from '../domain/types'
import { getDb } from './db'

// Local calendar date, matching the local-midnight window steps are summed over.
// toISOString() would give the UTC date and roll over early west of UTC.
function todayKey(): string {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export async function getTodayProgress(): Promise<DailyProgress> {
  const db = await getDb()
  const date = todayKey()
  const res = await db.query('SELECT * FROM daily_progress WHERE date = ?', [date])
  const row = res.values?.[0]
  if (!row) return { date, steps: 0, goalMet: false, drawCompleted: false }
  return { date: row.date, steps: row.steps, goalMet: !!row.goalMet, drawCompleted: !!row.drawCompleted }
}

/**
 * Once a day's StepGoal is met it stays met: raising the goal later that day must not take back the
 * Draw or the Points the day already earned.
 */
export async function upsertTodaySteps(steps: number, stepGoal: number): Promise<DailyProgress> {
  const db = await getDb()
  const date = todayKey()
  const goalMet = steps >= stepGoal
  await db.run(
    `INSERT INTO daily_progress (date, steps, goalMet, drawCompleted)
     VALUES (?, ?, ?, 0)
     ON CONFLICT(date) DO UPDATE SET steps = excluded.steps, goalMet = MAX(goalMet, excluded.goalMet)`,
    [date, steps, goalMet ? 1 : 0],
  )
  return getTodayProgress()
}

export async function markDrawCompleted(): Promise<void> {
  const db = await getDb()
  await db.run('UPDATE daily_progress SET drawCompleted = 1 WHERE date = ?', [todayKey()])
}

export async function countStepGoalDaysMet(): Promise<number> {
  const db = await getDb()
  const res = await db.query('SELECT COUNT(*) AS count FROM daily_progress WHERE goalMet = 1')
  return Number(res.values?.[0]?.count ?? 0)
}
