// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { localDateKey } from './localDate'
import { createTestDb, type TestDb } from './testing/sqliteTestDb'

let db: TestDb
vi.mock('./db', () => ({ getDb: () => Promise.resolve(db) }))

import { addCollectedEntry, deleteCollectedEntry, listCollectedEntries } from './collectionRepo'

describe('collectionRepo', () => {
  beforeEach(async () => {
    db = await createTestDb()
  })

  it('listCollectedEntries returns an empty array when there are no rows', async () => {
    expect(await listCollectedEntries()).toEqual([])
  })

  it('addCollectedEntry inserts a new entry and returns it', async () => {
    const entry = await addCollectedEntry('jatoba', 'focus_session', 'cerrado')

    expect(entry.speciesId).toBe('jatoba')
    expect(entry.method).toBe('focus_session')
    expect(entry.id).toEqual(expect.any(String))
    expect(() => new Date(entry.collectedAt).toISOString()).not.toThrow()
    expect(await listCollectedEntries()).toEqual([entry])
  })

  it('listCollectedEntries lists the newest first', async () => {
    const first = await addCollectedEntry('jatoba', 'draw', 'cerrado')
    await new Promise((resolve) => setTimeout(resolve, 2))
    const second = await addCollectedEntry('quati', 'draw', 'cerrado')

    expect(await listCollectedEntries()).toEqual([second, first])
  })

  it('addCollectedEntry records where and on which local day it was collected, queued for sync', async () => {
    const entry = await addCollectedEntry('jatoba', 'manual_sighting', 'cerrado')

    const res = await db.query('SELECT biomeId, localDate, focusSessionId, pendingSync FROM collected_entries')
    expect(res.values).toEqual([
      { biomeId: 'cerrado', localDate: localDateKey(new Date(entry.collectedAt)), focusSessionId: null, pendingSync: 1 },
    ])
  })

  it('deleteCollectedEntry removes only the given entry', async () => {
    const kept = await addCollectedEntry('jatoba', 'draw', 'cerrado')
    const undone = await addCollectedEntry('quati', 'manual_sighting', 'cerrado')

    await deleteCollectedEntry(undone.id)

    expect(await listCollectedEntries()).toEqual([kept])
  })
})
