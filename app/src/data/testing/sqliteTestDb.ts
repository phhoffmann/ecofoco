import type { capSQLiteVersionUpgrade, SQLiteDBConnection } from '@capacitor-community/sqlite'
import { addPreVersioningColumns, upgradeStatements } from '../schema'

interface SqlJsStatement {
  bind(values: unknown[]): void
  step(): boolean
  getAsObject(): Record<string, unknown>
  free(): void
}

interface SqlJsDatabase {
  exec(sql: string): void
  run(sql: string, values?: unknown[]): void
  prepare(sql: string): SqlJsStatement
  getRowsModified(): number
}

type Statement = { statement?: string; values?: unknown[] }

/** The slice of SQLiteDBConnection the repos use, backed by an in-memory sql.js database. */
export type TestDb = Pick<SQLiteDBConnection, 'query' | 'run' | 'execute' | 'executeSet'>

/** An empty database, at user_version 0 like a fresh install or one from before versioning. */
export async function createEmptyTestDb(): Promise<TestDb> {
  // The same sql.js build jeep-sqlite runs on the web (pinned by the workspace override), so tests exercise real SQLite semantics.
  const { default: initSqlJs } = (await import('sql.js')) as {
    default: () => Promise<{ Database: new () => SqlJsDatabase }>
  }
  const SQL = await initSqlJs()
  const sqlite = new SQL.Database()

  const db = {
    async query(statement: string, values: unknown[] = []) {
      const stmt = sqlite.prepare(statement)
      stmt.bind(values)
      const rows: Record<string, unknown>[] = []
      while (stmt.step()) rows.push(stmt.getAsObject())
      stmt.free()
      return { values: rows }
    },
    async run(statement: string, values: unknown[] = []) {
      sqlite.run(statement, values)
      return { changes: { changes: sqlite.getRowsModified() } }
    },
    async execute(statements: string) {
      sqlite.exec(statements)
      return { changes: { changes: sqlite.getRowsModified() } }
    },
    async executeSet(set: Statement[], transaction = true) {
      if (transaction) sqlite.exec('BEGIN')
      try {
        for (const { statement = '', values = [] } of set) sqlite.run(statement, values)
        if (transaction) sqlite.exec('COMMIT')
      } catch (err) {
        if (transaction) sqlite.exec('ROLLBACK')
        throw err
      }
      return { changes: { changes: sqlite.getRowsModified() } }
    },
  }
  return db as unknown as TestDb
}

/**
 * Opens the database the way the app does: upgrade statements run as `@capacitor-community/sqlite`
 * runs them (each version above user_version in one transaction, one statement per string), then the
 * pre-versioning columns are added.
 */
export async function openTestDb(db: TestDb, upgrades: capSQLiteVersionUpgrade[]): Promise<void> {
  const res = await db.query('PRAGMA user_version')
  const current = Number(res.values?.[0]?.user_version ?? 0)
  for (const { toVersion, statements } of [...upgrades].sort((a, b) => a.toVersion - b.toVersion)) {
    if (toVersion <= current) continue
    await db.executeSet(statements.map((statement) => ({ statement, values: [] })), true)
    await db.execute(`PRAGMA user_version = ${toVersion}`)
  }
  await addPreVersioningColumns(db)
}

/** A fresh install's database, at the newest schema version. */
export async function createTestDb(): Promise<TestDb> {
  const db = await createEmptyTestDb()
  await openTestDb(db, upgradeStatements([]))
  return db
}
