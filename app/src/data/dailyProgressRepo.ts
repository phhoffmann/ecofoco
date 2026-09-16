import type { DailyProgress } from '../domain/types'
import { getDb } from './db'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function getTodayProgress(): Promise<DailyProgress> {
  const db = await getDb()
  const date = todayKey()
  const res = await db.query('SELECT * FROM daily_progress WHERE date = ?', [date])
  const row = res.values?.[0]
  if (!row) return { date, steps: 0, goalMet: false, drawCompleted: false }
  return { date: row.date, steps: row.steps, goalMet: !!row.goalMet, drawCompleted: !!row.drawCompleted }
}

export async function upsertTodaySteps(steps: number, stepGoal: number): Promise<DailyProgress> {
  const db = await getDb()
  const date = todayKey()
  const goalMet = steps >= stepGoal
  await db.run(
    `INSERT INTO daily_progress (date, steps, goalMet, drawCompleted)
     VALUES (?, ?, ?, 0)
     ON CONFLICT(date) DO UPDATE SET steps = excluded.steps, goalMet = excluded.goalMet`,
    [date, steps, goalMet ? 1 : 0],
  )
  return getTodayProgress()
}

export async function markDrawCompleted(): Promise<void> {
  const db = await getDb()
  await db.run('UPDATE daily_progress SET drawCompleted = 1 WHERE date = ?', [todayKey()])
}
