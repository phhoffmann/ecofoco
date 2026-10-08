// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { migrate } from './schema'
import { createTestDb } from './testing/sqliteTestDb'

describe('migrate', () => {
  it('adds failReason to a focus_sessions table created before it existed, keeping its rows', async () => {
    const db = await createTestDb()
    await db.execute(`
      DROP TABLE focus_sessions;
      CREATE TABLE focus_sessions (
        id TEXT PRIMARY KEY, startedAt TEXT NOT NULL, endedAt TEXT NOT NULL,
        plannedDurationSeconds INTEGER NOT NULL, status TEXT NOT NULL
      );
      INSERT INTO focus_sessions VALUES ('old', '2026-01-01', '2026-01-01', 900, 'failed');
    `)

    await migrate(db as Parameters<typeof migrate>[0])
    // Running again on an up-to-date database is a no-op.
    await migrate(db as Parameters<typeof migrate>[0])

    const res = await db.query('SELECT id, failReason FROM focus_sessions')
    expect(res.values).toEqual([{ id: 'old', failReason: null }])
  })
})
