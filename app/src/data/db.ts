import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'
import { defineCustomElements } from 'jeep-sqlite/loader'
import { migrate } from './schema'

const DB_NAME = 'ecofoco'

const connection = new SQLiteConnection(CapacitorSQLite)

let dbPromise: Promise<SQLiteDBConnection> | null = null

/**
 * The web store's element. Without autosave jeep-sqlite keeps writes in memory only, so a reload
 * would lose every one of them.
 */
export function createWebStoreElement(doc: Document = document): HTMLElement {
  const jeepEl = doc.createElement('jeep-sqlite')
  jeepEl.setAttribute('autosave', 'true')
  return jeepEl
}

async function initWebStore() {
  if (Capacitor.getPlatform() !== 'web') return
  await defineCustomElements(window)
  document.body.appendChild(createWebStoreElement())
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
  await migrate(db)
  return db
}

export function getDb(): Promise<SQLiteDBConnection> {
  if (!dbPromise) dbPromise = openDb()
  return dbPromise
}
