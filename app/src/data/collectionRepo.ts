import type { BiomeId } from '../domain/biome'
import type { CollectedEntry, CollectionMethod } from '../domain/types'
import { getDb } from './db'
import { localDateKey } from './localDate'

export function newCollectedEntry(speciesId: string, method: CollectionMethod): CollectedEntry {
  return { id: crypto.randomUUID(), speciesId, collectedAt: new Date().toISOString(), method }
}

/** Where the entry was collected, and the FocusSession that earned it, if one did. */
export interface EntryOrigin {
  biomeId: BiomeId
  focusSessionId?: string
}

export function insertCollectedEntry(entry: CollectedEntry, { biomeId, focusSessionId }: EntryOrigin) {
  return {
    statement: `INSERT INTO collected_entries
      (id, speciesId, collectedAt, method, biomeId, localDate, focusSessionId, pendingSync)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    values: [
      entry.id,
      entry.speciesId,
      entry.collectedAt,
      entry.method,
      biomeId,
      localDateKey(new Date(entry.collectedAt)),
      focusSessionId ?? null,
    ],
  }
}

export async function listCollectedEntries(): Promise<CollectedEntry[]> {
  const db = await getDb()
  const res = await db.query('SELECT id, speciesId, collectedAt, method FROM collected_entries ORDER BY collectedAt DESC')
  return (res.values ?? []) as CollectedEntry[]
}

export async function addCollectedEntry(
  speciesId: string,
  method: CollectionMethod,
  biomeId: BiomeId,
): Promise<CollectedEntry> {
  const entry = newCollectedEntry(speciesId, method)
  const { statement, values } = insertCollectedEntry(entry, { biomeId })
  const db = await getDb()
  await db.run(statement, values)
  return entry
}

/**
 * Only for undoing a Manual Sighting right after it was logged; the Collection is otherwise permanent.
 * Every write except this undo delete is queued for sync; the delete is local-only and never synced.
 * The sync push must not push a Manual Sighting until its undo window has closed, so an undone
 * sighting never reaches the server.
 */
export async function deleteCollectedEntry(id: string): Promise<void> {
  const db = await getDb()
  await db.run('DELETE FROM collected_entries WHERE id = ?', [id])
}
