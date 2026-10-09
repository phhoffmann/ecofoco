import type { SQLiteDBConnection } from '@capacitor-community/sqlite'
import { migrate } from '../schema'

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

export async function createTestDb(): Promise<TestDb> {
  // The same sql.js build jeep-sqlite runs on the web, so tests exercise real SQLite semantics.
  const { default: initSqlJs } = (await import('jeep-sqlite/node_modules/sql.js')) as {
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
  await migrate(db as unknown as SQLiteDBConnection)
  return db as unknown as TestDb
}
