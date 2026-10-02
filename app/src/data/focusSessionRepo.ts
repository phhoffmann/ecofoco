import type { FocusSession, FocusSessionStatus } from '../domain/types'
import { getDb } from './db'

export async function recordFocusSession(
  startedAt: string,
  plannedDurationSeconds: number,
  status: FocusSessionStatus,
): Promise<FocusSession> {
  const session: FocusSession = {
    id: crypto.randomUUID(),
    startedAt,
    endedAt: new Date().toISOString(),
    plannedDurationSeconds,
    status,
  }
  const db = await getDb()
  await db.run(
    'INSERT INTO focus_sessions (id, startedAt, endedAt, plannedDurationSeconds, status) VALUES (?, ?, ?, ?, ?)',
    [session.id, session.startedAt, session.endedAt, session.plannedDurationSeconds, session.status],
  )
  return session
}

export async function listFocusSessions(): Promise<FocusSession[]> {
  const db = await getDb()
  const res = await db.query('SELECT * FROM focus_sessions ORDER BY startedAt DESC')
  return (res.values ?? []) as FocusSession[]
}

export async function countCompletedFocusSessions(): Promise<number> {
  const db = await getDb()
  const res = await db.query("SELECT COUNT(*) AS count FROM focus_sessions WHERE status = 'completed'")
  return Number(res.values?.[0]?.count ?? 0)
}
