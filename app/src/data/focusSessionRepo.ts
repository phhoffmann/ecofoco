import { focusSessionPoints, type BiomeId } from '../domain/biome'
import type { ActiveFocusSession, CollectedEntry, FocusFailReason, FocusSession } from '../domain/types'
import { insertCollectedEntry, newCollectedEntry } from './collectionRepo'
import { getDb } from './db'
import { localDateKey } from './localDate'

const CLEAR_ACTIVE = { statement: 'DELETE FROM active_focus_session', values: [] }

function insertFocusSession(session: FocusSession) {
  return {
    statement: `INSERT INTO focus_sessions
      (id, startedAt, endedAt, plannedDurationSeconds, status, failReason, localDate, points, pendingSync)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    values: [
      session.id,
      session.startedAt,
      session.endedAt,
      session.plannedDurationSeconds,
      session.status,
      session.failReason,
      // A session counts toward the day it started on.
      localDateKey(new Date(session.startedAt)),
      // Only a completed session earns Points.
      session.status === 'completed' ? focusSessionPoints(session.plannedDurationSeconds) : 0,
    ],
  }
}

export async function saveActiveFocusSession(active: ActiveFocusSession): Promise<void> {
  const db = await getDb()
  await db.run(
    'INSERT OR REPLACE INTO active_focus_session (id, startedAt, plannedDurationSeconds, speciesId, biomeId) VALUES (1, ?, ?, ?, ?)',
    [active.startedAt, active.plannedDurationSeconds, active.speciesId, active.biomeId],
  )
}

/** An active session as saved; `biomeId` is null for one saved before sessions recorded their Biome. */
export type SavedActiveFocusSession = Omit<ActiveFocusSession, 'biomeId'> & { biomeId: BiomeId | null }

export async function getActiveFocusSession(): Promise<SavedActiveFocusSession | null> {
  const db = await getDb()
  const res = await db.query(
    'SELECT startedAt, plannedDurationSeconds, speciesId, biomeId, backgroundedAt, backgroundedScreenOn FROM active_focus_session WHERE id = 1',
  )
  const row = res.values?.[0]
  if (!row) return null
  const session: SavedActiveFocusSession = {
    startedAt: row.startedAt,
    plannedDurationSeconds: row.plannedDurationSeconds,
    speciesId: row.speciesId,
    biomeId: row.biomeId,
  }
  if (row.backgroundedAt) session.backgrounded = { at: row.backgroundedAt, screenOn: Boolean(row.backgroundedScreenOn) }
  return session
}

/** Records the app leaving the foreground mid-session, so a relaunch after the process died can tell. */
export async function markActiveFocusSessionBackgrounded(at: string, screenOn: boolean): Promise<void> {
  const db = await getDb()
  await db.run('UPDATE active_focus_session SET backgroundedAt = ?, backgroundedScreenOn = ? WHERE id = 1', [at, screenOn ? 1 : 0])
}

export async function clearActiveFocusSessionBackgrounded(): Promise<void> {
  const db = await getDb()
  await db.run('UPDATE active_focus_session SET backgroundedAt = NULL, backgroundedScreenOn = NULL WHERE id = 1', [])
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
  await db.executeSet(
    [insertCollectedEntry(entry, { biomeId: active.biomeId, focusSessionId: session.id }), insertFocusSession(session), CLEAR_ACTIVE],
    true,
  )
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
  const res = await db.query(
    'SELECT id, startedAt, endedAt, plannedDurationSeconds, status, failReason FROM focus_sessions ORDER BY startedAt DESC',
  )
  return (res.values ?? []) as FocusSession[]
}

/** Points earned by every FocusSession, each at the rate it was earned at. */
export async function sumFocusSessionPoints(): Promise<number> {
  const db = await getDb()
  const res = await db.query('SELECT COALESCE(SUM(points), 0) AS points FROM focus_sessions')
  return Number(res.values?.[0]?.points ?? 0)
}
