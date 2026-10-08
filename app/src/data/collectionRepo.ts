import type { CollectedEntry, CollectionMethod } from '../domain/types'
import { getDb } from './db'

export function newCollectedEntry(speciesId: string, method: CollectionMethod): CollectedEntry {
  return { id: crypto.randomUUID(), speciesId, collectedAt: new Date().toISOString(), method }
}

export function insertCollectedEntry(entry: CollectedEntry) {
  return {
    statement: 'INSERT INTO collected_entries (id, speciesId, collectedAt, method) VALUES (?, ?, ?, ?)',
    values: [entry.id, entry.speciesId, entry.collectedAt, entry.method],
  }
}

export async function listCollectedEntries(): Promise<CollectedEntry[]> {
  const db = await getDb()
  const res = await db.query('SELECT * FROM collected_entries ORDER BY collectedAt DESC')
  return (res.values ?? []) as CollectedEntry[]
}

export async function addCollectedEntry(speciesId: string, method: CollectionMethod): Promise<CollectedEntry> {
  const entry = newCollectedEntry(speciesId, method)
  const { statement, values } = insertCollectedEntry(entry)
  const db = await getDb()
  await db.run(statement, values)
  return entry
}

/** Only for undoing a Manual Sighting right after it was logged; the Collection is otherwise permanent. */
export async function deleteCollectedEntry(id: string): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM collected_entries WHERE id = ?', [id])
}
