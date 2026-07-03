export type Locale = 'tr' | 'en' | 'de' | 'nl' | 'fr' | 'ga' | 'pt' | 'zh' | 'ja'

export interface LocaleInfo {
  code: Locale
  name: string
  flag: string
  tmdb: string
}

export const LOCALES: LocaleInfo[] = [
  { code: 'tr', name: 'Türkçe',    flag: '🇹🇷', tmdb: 'tr-TR' },
  { code: 'en', name: 'English',   flag: '🇬🇧', tmdb: 'en-US' },
  { code: 'de', name: 'Deutsch',   flag: '🇩🇪', tmdb: 'de-DE' },
  { code: 'nl', name: 'Nederlands',flag: '🇳🇱', tmdb: 'nl-NL' },
  { code: 'fr', name: 'Français',  flag: '🇫🇷', tmdb: 'fr-FR' },
  { code: 'ga', name: 'Gaeilge',   flag: '🇮🇪', tmdb: 'en-US' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', tmdb: 'pt-PT' },
  { code: 'zh', name: '中文',       flag: '🇨🇳', tmdb: 'zh-CN' },
  { code: 'ja', name: '日本語',     flag: '🇯🇵', tmdb: 'ja-JP' },
]

export const DEFAULT_LOCALE: Locale = 'tr'

export function isValidLocale(code: string): code is Locale {
  return LOCALES.some(l => l.code === code)
}

export function getLocaleInfo(code: Locale): LocaleInfo {
  return LOCALES.find(l => l.code === code) ?? LOCALES[0]
}

export function getTMDbLanguage(locale: Locale): string {
  return getLocaleInfo(locale).tmdb
}

export type Messages = Record<string, Record<string, string>>

export function createT(messages: Messages) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split('.')
    let value: unknown = messages
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[part]
      } else {
        return key
      }
    }
    if (typeof value !== 'string') return key
    if (!params) return value
    return Object.entries(params).reduce(
      (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      value
    )
  }
}
