import { isBiomeId, type BiomeId } from '../domain/biome'
import { getDb } from './db'

export interface BiomeUnlock {
  biomeId: BiomeId
  unlockedAt: string
  cost: number
}

/** Biomes bought with points. The home Biome is free and lives in settings instead. */
export async function listBiomeUnlocks(): Promise<BiomeUnlock[]> {
  const db = await getDb()
  const res = await db.query('SELECT * FROM biome_unlocks ORDER BY unlockedAt')
  return ((res.values ?? []) as BiomeUnlock[]).filter((u) => isBiomeId(u.biomeId))
}

export async function addBiomeUnlock(biomeId: BiomeId, cost: number): Promise<void> {
  const db = await getDb()
  await db.run('INSERT INTO biome_unlocks (biomeId, unlockedAt, cost) VALUES (?, ?, ?)', [
    biomeId,
    new Date().toISOString(),
    cost,
  ])
}
