import { DEFAULT_LOCALE, type Locale } from '../i18n/locale'
import { DEFAULT_STEP_GOAL } from '../domain/types'
import { getDb } from './db'

const NOTIFICATIONS_ENABLED_KEY = 'notificationsEnabled'
const LANGUAGE_KEY = 'language'
const STEP_GOAL_KEY = 'stepGoal'

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
