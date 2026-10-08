import type { SQLiteDBConnection } from '@capacitor-community/sqlite'

export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS collected_entries (
    id TEXT PRIMARY KEY,
    speciesId TEXT NOT NULL,
    collectedAt TEXT NOT NULL,
    method TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    startedAt TEXT NOT NULL,
    endedAt TEXT NOT NULL,
    plannedDurationSeconds INTEGER NOT NULL,
    status TEXT NOT NULL,
    failReason TEXT
  );

  CREATE TABLE IF NOT EXISTS active_focus_session (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    startedAt TEXT NOT NULL,
    plannedDurationSeconds INTEGER NOT NULL,
    speciesId TEXT NOT NULL,
    backgroundedAt TEXT,
    backgroundedScreenOn INTEGER
  );

  CREATE TABLE IF NOT EXISTS daily_progress (
    date TEXT PRIMARY KEY,
    steps INTEGER NOT NULL DEFAULT 0,
    goalMet INTEGER NOT NULL DEFAULT 0,
    drawCompleted INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS biome_unlocks (
    biomeId TEXT PRIMARY KEY,
    unlockedAt TEXT NOT NULL,
    cost INTEGER NOT NULL
  );
`

type MigratableDb = Pick<SQLiteDBConnection, 'execute' | 'query'>

async function hasColumn(db: MigratableDb, table: string, column: string): Promise<boolean> {
  const res = await db.query(`PRAGMA table_info(${table})`)
  return (res.values ?? []).some((c: { name: string }) => c.name === column)
}

/** Creates missing tables, then adds columns that installs from before them lack. */
export async function migrate(db: MigratableDb): Promise<void> {
  await db.execute(SCHEMA)
  if (!(await hasColumn(db, 'focus_sessions', 'failReason'))) {
    await db.execute('ALTER TABLE focus_sessions ADD COLUMN failReason TEXT')
  }
}
