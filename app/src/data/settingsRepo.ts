import { isBiomeId, type BiomeId, type HomeBiomeSource } from '../domain/biome'
import { DEFAULT_LOCALE, type Locale } from '../i18n/locale'
import { DEFAULT_COLLECTION_VIEW, DEFAULT_STEP_GOAL, type CollectionView } from '../domain/types'
import { getDb } from './db'

const NOTIFICATIONS_ENABLED_KEY = 'notificationsEnabled'
const LANGUAGE_KEY = 'language'
const STEP_GOAL_KEY = 'stepGoal'
const COLLECTION_VIEW_KEY = 'collectionView'
const HOME_BIOME_KEY = 'homeBiome'
const CURRENT_BIOME_KEY = 'currentBiome'
const HOME_BIOME_SOURCE_KEY = 'homeBiomeSource'

async function getSetting(key: string): Promise<string | undefined> {
  const db = await getDb()
  const res = await db.query('SELECT value FROM settings WHERE key = ?', [key])
  return res.values?.[0]?.value
}

async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb()
  await db.run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  )
}

export async function getNotificationsEnabled(): Promise<boolean> {
  return (await getSetting(NOTIFICATIONS_ENABLED_KEY)) === 'true'
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await setSetting(NOTIFICATIONS_ENABLED_KEY, String(enabled))
}

export async function getLanguage(): Promise<Locale> {
  const value = await getSetting(LANGUAGE_KEY)
  return value === 'en' || value === 'pt-BR' ? value : DEFAULT_LOCALE
}

export async function setLanguage(language: Locale): Promise<void> {
  await setSetting(LANGUAGE_KEY, language)
}

export async function getStepGoal(): Promise<number> {
  const value = await getSetting(STEP_GOAL_KEY)
  const parsed = value ? Number(value) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_STEP_GOAL
}

export async function setStepGoal(stepGoal: number): Promise<void> {
  await setSetting(STEP_GOAL_KEY, String(stepGoal))
}

export async function getCollectionView(): Promise<CollectionView> {
  const value = await getSetting(COLLECTION_VIEW_KEY)
  return value === 'grid' || value === 'isometric' ? value : DEFAULT_COLLECTION_VIEW
}

export async function setCollectionView(view: CollectionView): Promise<void> {
  await setSetting(COLLECTION_VIEW_KEY, view)
}

/** Only the Biome id is kept — never the coordinates it was detected from. Null until onboarding. */
export async function getHomeBiome(): Promise<BiomeId | null> {
  const value = await getSetting(HOME_BIOME_KEY)
  return isBiomeId(value) ? value : null
}

export async function setHomeBiome(biome: BiomeId, source: HomeBiomeSource): Promise<void> {
  await setSetting(HOME_BIOME_KEY, biome)
  await setSetting(HOME_BIOME_SOURCE_KEY, source)
}

/** How the home Biome was set. Installs from before this setting count as 'picked'. */
export async function getHomeBiomeSource(): Promise<HomeBiomeSource> {
  return (await getSetting(HOME_BIOME_SOURCE_KEY)) === 'detected' ? 'detected' : 'picked'
}

export async function getCurrentBiome(): Promise<BiomeId | null> {
  const value = await getSetting(CURRENT_BIOME_KEY)
  return isBiomeId(value) ? value : null
}

export async function setCurrentBiome(biome: BiomeId): Promise<void> {
  await setSetting(CURRENT_BIOME_KEY, biome)
}
