import type { CollectedEntry, CollectionMethod } from '../domain/types'
import { getDb } from './db'

export async function listCollectedEntries(): Promise<CollectedEntry[]> {
  const db = await getDb()
  const res = await db.query('SELECT * FROM collected_entries ORDER BY collectedAt DESC')
  return (res.values ?? []) as CollectedEntry[]
}

export async function addCollectedEntry(speciesId: string, method: CollectionMethod): Promise<CollectedEntry> {
  const entry: CollectedEntry = {
    id: crypto.randomUUID(),
    speciesId,
    collectedAt: new Date().toISOString(),
    method,
  }
  const db = await getDb()
  await db.run('INSERT INTO collected_entries (id, speciesId, collectedAt, method) VALUES (?, ?, ?, ?)', [
    entry.id,
    entry.speciesId,
    entry.collectedAt,
    entry.method,
  ])
  return entry
}
