import type { ActiveFocusSession, CollectedEntry, FocusFailReason, FocusSession } from '../domain/types'
import { insertCollectedEntry, newCollectedEntry } from './collectionRepo'
import { getDb } from './db'

const CLEAR_ACTIVE = { statement: 'DELETE FROM active_focus_session', values: [] }

function insertFocusSession(session: FocusSession) {
  return {
    statement:
      'INSERT INTO focus_sessions (id, startedAt, endedAt, plannedDurationSeconds, status, failReason) VALUES (?, ?, ?, ?, ?, ?)',
    values: [
      session.id,
      session.startedAt,
      session.endedAt,
      session.plannedDurationSeconds,
      session.status,
      session.failReason,
    ],
  }
}

export async function saveActiveFocusSession(active: ActiveFocusSession): Promise<void> {
  const db = await getDb()
  await db.run(
    'INSERT OR REPLACE INTO active_focus_session (id, startedAt, plannedDurationSeconds, speciesId) VALUES (1, ?, ?, ?)',
    [active.startedAt, active.plannedDurationSeconds, active.speciesId],
  )
}

export async function getActiveFocusSession(): Promise<ActiveFocusSession | null> {
  const db = await getDb()
  const res = await db.query('SELECT startedAt, plannedDurationSeconds, speciesId FROM active_focus_session WHERE id = 1')
  return (res.values?.[0] as ActiveFocusSession | undefined) ?? null
}

/** Records the completed session and collects its Plant in one transaction, so neither exists without the other. */
export async function completeFocusSession(
  active: ActiveFocusSession,
): Promise<{ session: FocusSession; entry: CollectedEntry }> {
  const entry = newCollectedEntry(active.speciesId, 'focus_session')
  const session: FocusSession = {
    id: crypto.randomUUID(),
    startedAt: active.startedAt,
    endedAt: entry.collectedAt,
    plannedDurationSeconds: active.plannedDurationSeconds,
    status: 'completed',
    failReason: null,
  }
  const db = await getDb()
  await db.executeSet([insertCollectedEntry(entry), insertFocusSession(session), CLEAR_ACTIVE], true)
  return { session, entry }
}

export async function failFocusSession(
  startedAt: string,
  plannedDurationSeconds: number,
  reason: FocusFailReason,
): Promise<FocusSession> {
  const session: FocusSession = {
    id: crypto.randomUUID(),
    startedAt,
    endedAt: new Date().toISOString(),
    plannedDurationSeconds,
    status: 'failed',
    failReason: reason,
  }
  const db = await getDb()
  await db.executeSet([insertFocusSession(session), CLEAR_ACTIVE], true)
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
