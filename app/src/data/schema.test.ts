// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { SPECIES_CATALOG } from '../domain/species'
import { localDateKey } from './localDate'
import { DB_VERSION, SYNCED_TABLES, upgradeStatements } from './schema'
import { createEmptyTestDb, createTestDb, openTestDb, type TestDb } from './testing/sqliteTestDb'

// The schema every install had before versioning: user_version 0, tables made by CREATE TABLE IF NOT EXISTS.
const PRE_VERSIONING_SCHEMA = `
  CREATE TABLE collected_entries (id TEXT PRIMARY KEY, speciesId TEXT NOT NULL, collectedAt TEXT NOT NULL, method TEXT NOT NULL);
  CREATE TABLE focus_sessions (
    id TEXT PRIMARY KEY, startedAt TEXT NOT NULL, endedAt TEXT NOT NULL,
    plannedDurationSeconds INTEGER NOT NULL, status TEXT NOT NULL, failReason TEXT
  );
  CREATE TABLE active_focus_session (
    id INTEGER PRIMARY KEY CHECK (id = 1), startedAt TEXT NOT NULL, plannedDurationSeconds INTEGER NOT NULL,
    speciesId TEXT NOT NULL, backgroundedAt TEXT, backgroundedScreenOn INTEGER
  );
  CREATE TABLE daily_progress (
    date TEXT PRIMARY KEY, steps INTEGER NOT NULL DEFAULT 0, goalMet INTEGER NOT NULL DEFAULT 0, drawCompleted INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE biome_unlocks (biomeId TEXT PRIMARY KEY, unlockedAt TEXT NOT NULL, cost INTEGER NOT NULL);
`

// 02:30 UTC is still the previous day in Brazil, where the local date and the UTC date differ.
const COMPLETED_AT = '2026-03-01T02:30:00.000Z'

const PRE_VERSIONING_DATA = `
  INSERT INTO focus_sessions VALUES
    ('session-done', '2026-03-01T02:15:00.000Z', '${COMPLETED_AT}', 900, 'completed', NULL),
    ('session-failed', '2026-03-02T10:00:00.000Z', '2026-03-02T10:05:00.000Z', 900, 'failed', 'gave_up');
  INSERT INTO collected_entries VALUES
    ('entry-focus', 'sanhaco-da-amazonia', '${COMPLETED_AT}', 'focus_session'),
    ('entry-draw', 'urubu-preto', '2026-03-02T12:00:00.000Z', 'draw');
  INSERT INTO active_focus_session VALUES (1, '2026-03-03T09:00:00.000Z', 900, 'jatoba', NULL, NULL);
  INSERT INTO daily_progress VALUES ('2026-03-02', 7000, 1, 1);
  INSERT INTO settings VALUES ('stepGoal', '6000');
  INSERT INTO biome_unlocks VALUES ('cerrado', '2026-03-02T13:00:00.000Z', 100);
`

const CATALOG = [
  { id: 'sanhaco-da-amazonia', biome: ['amazon' as const] },
  { id: 'urubu-preto', biome: ['amazon' as const, 'atlantic-forest' as const] },
]

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

async function columns(db: TestDb, table: string): Promise<string[]> {
  const res = await db.query(`PRAGMA table_info(${table})`)
  return (res.values ?? []).map((c) => c.name)
}

async function userVersion(db: TestDb): Promise<number> {
  return (await db.query('PRAGMA user_version')).values?.[0]?.user_version
}

describe('upgrade statements', () => {
  it('hold one statement per string, as Android runs only the first statement of each', () => {
    for (const { statements } of upgradeStatements(CATALOG)) {
      for (const statement of statements) expect(statement).not.toContain(';')
    }
  })

  it('end at DB_VERSION', () => {
    expect(upgradeStatements([]).at(-1)?.toVersion).toBe(DB_VERSION)
  })
})

describe('migrating an install from before versioning', () => {
  beforeAll(() => {
    vi.stubEnv('TZ', 'America/Sao_Paulo')
  })
  afterAll(() => {
    vi.unstubAllEnvs()
  })

  async function migratedDb(): Promise<TestDb> {
    const db = await createEmptyTestDb()
    await db.execute(PRE_VERSIONING_SCHEMA + PRE_VERSIONING_DATA)
    await openTestDb(db, upgradeStatements(CATALOG))
    return db
  }

  it('keeps every row', async () => {
    const db = await migratedDb()

    expect((await db.query('SELECT id, speciesId, collectedAt, method FROM collected_entries ORDER BY id')).values).toEqual([
      { id: 'entry-draw', speciesId: 'urubu-preto', collectedAt: '2026-03-02T12:00:00.000Z', method: 'draw' },
      { id: 'entry-focus', speciesId: 'sanhaco-da-amazonia', collectedAt: COMPLETED_AT, method: 'focus_session' },
    ])
    expect((await db.query('SELECT id, status, failReason FROM focus_sessions ORDER BY id')).values).toEqual([
      { id: 'session-done', status: 'completed', failReason: null },
      { id: 'session-failed', status: 'failed', failReason: 'gave_up' },
    ])
    // Saved before sessions recorded their Biome.
    expect((await db.query('SELECT speciesId, biomeId FROM active_focus_session')).values).toEqual([
      { speciesId: 'jatoba', biomeId: null },
    ])
    expect((await db.query('SELECT date, steps, goalMet, drawCompleted FROM daily_progress')).values).toEqual([
      { date: '2026-03-02', steps: 7000, goalMet: 1, drawCompleted: 1 },
    ])
    expect((await db.query('SELECT key, value FROM settings')).values).toEqual([{ key: 'stepGoal', value: '6000' }])
    expect((await db.query('SELECT biomeId, cost FROM biome_unlocks')).values).toEqual([{ biomeId: 'cerrado', cost: 100 }])
    expect(await userVersion(db)).toBe(DB_VERSION)
  })

  it('queues every existing synced row for upload', async () => {
    const db = await migratedDb()
    for (const table of SYNCED_TABLES) {
      const res = await db.query(`SELECT COUNT(*) AS pending FROM ${table} WHERE pendingSync = 1`)
      const all = await db.query(`SELECT COUNT(*) AS count FROM ${table}`)
      expect(res.values?.[0]?.pending, table).toBe(all.values?.[0]?.count)
      expect(all.values?.[0]?.count, table).toBeGreaterThan(0)
    }
  })

  it('backfills local dates, the session that earned a Plant, and single-Biome species', async () => {
    const db = await migratedDb()

    expect((await db.query('SELECT id, localDate, focusSessionId, biomeId FROM collected_entries ORDER BY id')).values).toEqual([
      // Found in two Biomes: where it was drawn is unknown.
      { id: 'entry-draw', localDate: '2026-03-02', focusSessionId: null, biomeId: null },
      { id: 'entry-focus', localDate: '2026-02-28', focusSessionId: 'session-done', biomeId: 'amazon' },
    ])
    expect((await db.query('SELECT id, localDate FROM focus_sessions ORDER BY id')).values).toEqual([
      { id: 'session-done', localDate: '2026-02-28' },
      { id: 'session-failed', localDate: '2026-03-02' },
    ])
    // The SQL backfill and the repos agree on what "local date" means.
    expect(localDateKey(new Date(COMPLETED_AT))).toBe('2026-02-28')
  })

  it('records the points already earned at the rate they were earned at', async () => {
    const db = await migratedDb()

    expect((await db.query('SELECT id, points FROM focus_sessions ORDER BY id')).values).toEqual([
      { id: 'session-done', points: 10 },
      { id: 'session-failed', points: 0 },
    ])
    expect((await db.query('SELECT date, points FROM daily_progress')).values).toEqual([{ date: '2026-03-02', points: 10 }])
  })

  it('stamps rows that track updates with the migration time', async () => {
    const db = await migratedDb()
    for (const table of ['daily_progress', 'settings']) {
      const res = await db.query(`SELECT updatedAt FROM ${table}`)
      expect(res.values?.[0]?.updatedAt, table).toMatch(ISO_TIMESTAMP)
    }
  })

  it('gives the device an id, with nothing synced yet', async () => {
    const db = await migratedDb()
    const res = await db.query('SELECT deviceId, userId, lastPulledSeq, lastSyncedAt FROM sync_state')
    expect(res.values).toEqual([{ deviceId: expect.stringMatching(UUID_V4), userId: null, lastPulledSeq: 0, lastSyncedAt: null }])
  })

  it('runs with the bundled species catalog', async () => {
    const db = await createEmptyTestDb()
    await db.execute(PRE_VERSIONING_SCHEMA + PRE_VERSIONING_DATA)

    await openTestDb(db, upgradeStatements(SPECIES_CATALOG))

    expect((await db.query("SELECT biomeId FROM collected_entries WHERE id = 'entry-focus'")).values).toEqual([
      { biomeId: 'amazon' },
    ])
  })

  it('does nothing when the database is opened again', async () => {
    const db = await migratedDb()
    const before = await db.query('SELECT deviceId FROM sync_state')

    await openTestDb(db, upgradeStatements(CATALOG))

    expect((await db.query('SELECT deviceId FROM sync_state')).values).toEqual(before.values)
    expect((await db.query('SELECT COUNT(*) AS count FROM collected_entries')).values).toEqual([{ count: 2 }])
  })
})

describe('a fresh install', () => {
  async function expectNewestSchema(db: TestDb) {
    expect(await columns(db, 'collected_entries')).toEqual([
      'id', 'speciesId', 'collectedAt', 'method', 'pendingSync', 'biomeId', 'localDate', 'focusSessionId',
    ])
    expect(await columns(db, 'focus_sessions')).toContain('localDate')
    expect(await columns(db, 'focus_sessions')).toContain('points')
    expect(await columns(db, 'daily_progress')).toContain('points')
    expect(await columns(db, 'active_focus_session')).toContain('biomeId')
    expect(await columns(db, 'daily_progress')).toContain('updatedAt')
    expect(await columns(db, 'settings')).toContain('updatedAt')
    for (const table of SYNCED_TABLES) expect(await columns(db, table), table).toContain('pendingSync')
    expect((await db.query('SELECT deviceId FROM sync_state')).values).toEqual([{ deviceId: expect.stringMatching(UUID_V4) }])
    expect(await userVersion(db)).toBe(DB_VERSION)
  }

  it('gets every table and sync column', async () => {
    await expectNewestSchema(await createTestDb())
  })

  it('gets every table and sync column even when the empty database is already at version 1', async () => {
    const db = await createEmptyTestDb()
    await db.execute('PRAGMA user_version = 1')

    await openTestDb(db, upgradeStatements([]))

    await expectNewestSchema(db)
  })

  it('gives each device its own id', async () => {
    const [a, b] = await Promise.all([createTestDb(), createTestDb()])
    const id = async (db: TestDb) => (await db.query('SELECT deviceId FROM sync_state')).values?.[0]?.deviceId
    expect(await id(a)).not.toBe(await id(b))
  })
})

describe('installs older than the pre-versioning columns', () => {
  it('get failReason added to focus_sessions, keeping its rows', async () => {
    const db = await createEmptyTestDb()
    await db.execute(`
      CREATE TABLE focus_sessions (
        id TEXT PRIMARY KEY, startedAt TEXT NOT NULL, endedAt TEXT NOT NULL,
        plannedDurationSeconds INTEGER NOT NULL, status TEXT NOT NULL
      );
      INSERT INTO focus_sessions VALUES ('old', '2026-01-01', '2026-01-01', 900, 'failed');
    `)

    await openTestDb(db, upgradeStatements([]))

    const res = await db.query('SELECT id, failReason FROM focus_sessions')
    expect(res.values).toEqual([{ id: 'old', failReason: null }])
  })

  it('get the backgrounded columns added to active_focus_session, keeping its row', async () => {
    const db = await createEmptyTestDb()
    await db.execute(`
      CREATE TABLE active_focus_session (
        id INTEGER PRIMARY KEY CHECK (id = 1), startedAt TEXT NOT NULL,
        plannedDurationSeconds INTEGER NOT NULL, speciesId TEXT NOT NULL
      );
      INSERT INTO active_focus_session VALUES (1, '2026-01-01', 900, 'jatoba');
    `)

    await openTestDb(db, upgradeStatements([]))

    const res = await db.query('SELECT speciesId, backgroundedAt, backgroundedScreenOn FROM active_focus_session')
    expect(res.values).toEqual([{ speciesId: 'jatoba', backgroundedAt: null, backgroundedScreenOn: null }])
  })
})
