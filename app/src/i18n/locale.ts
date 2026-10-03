export type Locale = 'en' | 'pt-BR'

export const SUPPORTED_LOCALES: Locale[] = ['en', 'pt-BR']

export const DEFAULT_LOCALE: Locale = 'en'

/** The supported Locale for an i18next language tag, falling back to the default. */
export function toLocale(language: string): Locale {
  return (SUPPORTED_LOCALES as string[]).includes(language) ? (language as Locale) : DEFAULT_LOCALE
}
