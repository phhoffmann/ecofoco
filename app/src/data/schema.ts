import type { capSQLiteVersionUpgrade, SQLiteDBConnection } from '@capacitor-community/sqlite'
import type { BiomeId } from '../domain/biome'

/** The newest schema version: the last `toVersion` in {@link upgradeStatements}. */
export const DB_VERSION = 2

/** Tables a sync with the server will carry: every write to them sets `pendingSync = 1`. */
export const SYNCED_TABLES = ['collected_entries', 'focus_sessions', 'daily_progress', 'biome_unlocks', 'settings'] as const

/**
 * The schema before versioning. Installs from then sit at user_version 0 with these tables already
 * there, so IF NOT EXISTS makes this step a no-op for them and the first create for new installs.
 */
const V1_BASELINE = [
  `CREATE TABLE IF NOT EXISTS collected_entries (
    id TEXT PRIMARY KEY,
    speciesId TEXT NOT NULL,
    collectedAt TEXT NOT NULL,
    method TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    startedAt TEXT NOT NULL,
    endedAt TEXT NOT NULL,
    plannedDurationSeconds INTEGER NOT NULL,
    status TEXT NOT NULL,
    failReason TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS active_focus_session (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    startedAt TEXT NOT NULL,
    plannedDurationSeconds INTEGER NOT NULL,
    speciesId TEXT NOT NULL,
    backgroundedAt TEXT,
    backgroundedScreenOn INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS daily_progress (
    date TEXT PRIMARY KEY,
    steps INTEGER NOT NULL DEFAULT 0,
    goalMet INTEGER NOT NULL DEFAULT 0,
    drawCompleted INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS biome_unlocks (
    biomeId TEXT PRIMARY KEY,
    unlockedAt TEXT NOT NULL,
    cost INTEGER NOT NULL
  )`,
]

const NOW_ISO = `strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`

// A random UUID v4, so the device id looks like every other client-generated id.
const UUID_V4 = `lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
  substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) ||
  substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))`

const sqlString = (value: string) => `'${value.replaceAll("'", "''")}'`

/** Entries of a species found in one Biome only were necessarily collected there. */
function backfillEntryBiomes(catalog: readonly { id: string; biome: readonly BiomeId[] }[]): string[] {
  const cases = catalog
    .filter((s) => s.biome.length === 1)
    .map((s) => `WHEN ${sqlString(s.id)} THEN ${sqlString(s.biome[0])}`)
  if (cases.length === 0) return []
  return [`UPDATE collected_entries SET biomeId = CASE speciesId ${cases.join(' ')} END`]
}

/**
 * Prepares the tables for sync: what is still to upload, when rows changed, and who this device is.
 * Starts with the baseline again, so it works on an empty database even if the v1 step was skipped.
 */
function v2Sync(catalog: readonly { id: string; biome: readonly BiomeId[] }[]): string[] {
  return [
    ...V1_BASELINE,
    ...SYNCED_TABLES.map((table) => `ALTER TABLE ${table} ADD COLUMN pendingSync INTEGER NOT NULL DEFAULT 1`),
    'ALTER TABLE collected_entries ADD COLUMN biomeId TEXT',
    'ALTER TABLE collected_entries ADD COLUMN localDate TEXT',
    'ALTER TABLE collected_entries ADD COLUMN focusSessionId TEXT',
    'ALTER TABLE focus_sessions ADD COLUMN localDate TEXT',
    'ALTER TABLE daily_progress ADD COLUMN updatedAt TEXT',
    'ALTER TABLE settings ADD COLUMN updatedAt TEXT',
    'ALTER TABLE active_focus_session ADD COLUMN biomeId TEXT',

    // The local calendar day, as the app counts days; 'localtime' is the device's time zone.
    `UPDATE collected_entries SET localDate = date(collectedAt, 'localtime')`,
    `UPDATE focus_sessions SET localDate = date(startedAt, 'localtime')`,
    // A completed session's Plant was collected in the same transaction, stamped with its end time.
    `UPDATE collected_entries SET focusSessionId = (
      SELECT f.id FROM focus_sessions f
      WHERE f.status = 'completed' AND f.endedAt = collected_entries.collectedAt
      LIMIT 1
    ) WHERE method = 'focus_session'`,
    ...backfillEntryBiomes(catalog),
    `UPDATE daily_progress SET updatedAt = ${NOW_ISO}`,
    `UPDATE settings SET updatedAt = ${NOW_ISO}`,

    `CREATE TABLE sync_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      deviceId TEXT NOT NULL,
      userId TEXT,
      lastPulledSeq INTEGER NOT NULL DEFAULT 0,
      lastSyncedAt TEXT
    )`,
    `INSERT INTO sync_state (id, deviceId) VALUES (1, ${UUID_V4})`,
  ]
}

/**
 * Every schema version, for `@capacitor-community/sqlite` to run on open: each step above the
 * database's user_version runs in its own transaction. Each string must hold exactly one statement,
 * since Android runs them through execSQL, which ignores anything after the first.
 *
 * `catalog` maps species to their Biomes, for backfilling where an old entry was collected.
 */
export function upgradeStatements(
  catalog: readonly { id: string; biome: readonly BiomeId[] }[],
): capSQLiteVersionUpgrade[] {
  return [
    { toVersion: 1, statements: V1_BASELINE },
    { toVersion: 2, statements: v2Sync(catalog) },
  ]
}

type MigratableDb = Pick<SQLiteDBConnection, 'execute' | 'query'>

async function hasColumn(db: MigratableDb, table: string, column: string): Promise<boolean> {
  const res = await db.query(`PRAGMA table_info(${table})`)
  return (res.values ?? []).some((c: { name: string }) => c.name === column)
}

/**
 * Adds columns that predate versioning to installs older than them. The v1 baseline creates them for
 * new installs but cannot add them to tables that already exist, and SQLite has no ADD COLUMN IF NOT
 * EXISTS for an upgrade statement to use.
 */
export async function addPreVersioningColumns(db: MigratableDb): Promise<void> {
  if (!(await hasColumn(db, 'focus_sessions', 'failReason'))) {
    await db.execute('ALTER TABLE focus_sessions ADD COLUMN failReason TEXT')
  }
  if (!(await hasColumn(db, 'active_focus_session', 'backgroundedAt'))) {
    await db.execute('ALTER TABLE active_focus_session ADD COLUMN backgroundedAt TEXT')
  }
  if (!(await hasColumn(db, 'active_focus_session', 'backgroundedScreenOn'))) {
    await db.execute('ALTER TABLE active_focus_session ADD COLUMN backgroundedScreenOn INTEGER')
  }
}
