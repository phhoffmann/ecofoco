import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'
import { defineCustomElements } from 'jeep-sqlite/loader'

const DB_NAME = 'ecofoco'

const SCHEMA = `
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
    status TEXT NOT NULL
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
`

const connection = new SQLiteConnection(CapacitorSQLite)

let dbPromise: Promise<SQLiteDBConnection> | null = null

async function initWebStore() {
  if (Capacitor.getPlatform() !== 'web') return
  await defineCustomElements(window)
  const jeepEl = document.createElement('jeep-sqlite')
  document.body.appendChild(jeepEl)
  await customElements.whenDefined('jeep-sqlite')
  await connection.initWebStore()
}

async function openDb(): Promise<SQLiteDBConnection> {
  await initWebStore()

  const isConn = (await connection.isConnection(DB_NAME, false)).result
  const db = isConn
    ? await connection.retrieveConnection(DB_NAME, false)
    : await connection.createConnection(DB_NAME, false, 'no-encryption', 1, false)

  await db.open()
  await db.execute(SCHEMA)
  return db
}

export function getDb(): Promise<SQLiteDBConnection> {
  if (!dbPromise) dbPromise = openDb()
  return dbPromise
}
