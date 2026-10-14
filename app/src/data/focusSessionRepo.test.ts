// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActiveFocusSession } from '../domain/types'
import { localDateKey } from './localDate'
import { createTestDb, type TestDb } from './testing/sqliteTestDb'

let db: TestDb
vi.mock('./db', () => ({ getDb: () => Promise.resolve(db) }))

import { listCollectedEntries } from './collectionRepo'
import {
  completeFocusSession,
  countCompletedFocusSessions,
  failFocusSession,
  clearActiveFocusSessionBackgrounded,
  getActiveFocusSession,
  listFocusSessions,
  markActiveFocusSessionBackgrounded,
  saveActiveFocusSession,
} from './focusSessionRepo'

const active: ActiveFocusSession = {
  startedAt: '2026-09-10T10:00:00.000Z',
  plannedDurationSeconds: 900,
  speciesId: 'jatoba',
}

describe('focusSessionRepo', () => {
  beforeEach(async () => {
    db = await createTestDb()
  })

  it('persists the active session until it ends', async () => {
    expect(await getActiveFocusSession()).toBeNull()

    await saveActiveFocusSession(active)
    expect(await getActiveFocusSession()).toEqual(active)

    // Starting again replaces it: there is only ever one running session.
    await saveActiveFocusSession({ ...active, speciesId: 'ipe-amarelo' })
    expect(await getActiveFocusSession()).toEqual({ ...active, speciesId: 'ipe-amarelo' })
  })

  it('remembers when the app was backgrounded mid-session, and forgets it on return', async () => {
    await saveActiveFocusSession(active)

    await markActiveFocusSessionBackgrounded('2026-09-10T10:05:00.000Z', true)
    expect(await getActiveFocusSession()).toEqual({ ...active, backgrounded: { at: '2026-09-10T10:05:00.000Z', screenOn: true } })

    await markActiveFocusSessionBackgrounded('2026-09-10T10:06:00.000Z', false)
    expect((await getActiveFocusSession())?.backgrounded).toEqual({ at: '2026-09-10T10:06:00.000Z', screenOn: false })

    await clearActiveFocusSessionBackgrounded()
    expect(await getActiveFocusSession()).toEqual(active)
  })

  it('completes a session by collecting its plant, recording it and clearing the active session together', async () => {
    await saveActiveFocusSession(active)

    const { session, entry } = await completeFocusSession(active, 'cerrado')

    expect(session).toMatchObject({ startedAt: active.startedAt, plannedDurationSeconds: 900, status: 'completed', failReason: null })
    expect(entry).toMatchObject({ speciesId: 'jatoba', method: 'focus_session' })
    expect(await listCollectedEntries()).toEqual([entry])
    expect(await listFocusSessions()).toEqual([session])
    expect(await countCompletedFocusSessions()).toBe(1)
    expect(await getActiveFocusSession()).toBeNull()
  })

  it('writes neither the entry nor the session when either write fails', async () => {
    await saveActiveFocusSession(active)
    // Break the second write of the transaction.
    await db.execute('DROP TABLE focus_sessions')

    await expect(completeFocusSession(active, 'cerrado')).rejects.toThrow()

    expect(await listCollectedEntries()).toEqual([])
    expect(await getActiveFocusSession()).toEqual(active)
  })

  it('records why a session failed and collects nothing', async () => {
    await saveActiveFocusSession(active)

    const session = await failFocusSession(active.startedAt, 900, 'gave_up')

    expect(session).toMatchObject({ status: 'failed', failReason: 'gave_up' })
    expect(await listFocusSessions()).toEqual([session])
    expect(await listCollectedEntries()).toEqual([])
    expect(await countCompletedFocusSessions()).toBe(0)
    expect(await getActiveFocusSession()).toBeNull()
  })

  it('links the collected Plant to its session, and queues both for sync', async () => {
    await saveActiveFocusSession(active)

    const { session, entry } = await completeFocusSession(active, 'cerrado')

    const entries = await db.query('SELECT biomeId, localDate, focusSessionId, pendingSync FROM collected_entries')
    expect(entries.values).toEqual([
      { biomeId: 'cerrado', localDate: localDateKey(new Date(entry.collectedAt)), focusSessionId: session.id, pendingSync: 1 },
    ])
    const sessions = await db.query('SELECT localDate, pendingSync FROM focus_sessions')
    expect(sessions.values).toEqual([{ localDate: localDateKey(new Date(active.startedAt)), pendingSync: 1 }])
  })

  it('queues a failed session for sync, dated by the local day it started', async () => {
    await failFocusSession(active.startedAt, 900, 'left_app')

    const res = await db.query('SELECT localDate, pendingSync FROM focus_sessions')
    expect(res.values).toEqual([{ localDate: localDateKey(new Date(active.startedAt)), pendingSync: 1 }])
  })
})
