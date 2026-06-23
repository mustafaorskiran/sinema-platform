import { cookies } from 'next/headers'
import { isValidLocale, DEFAULT_LOCALE, createT, type Locale, type Messages } from './i18n-config'

export type { Locale, Messages, LocaleInfo } from './i18n-config'
export { LOCALES, DEFAULT_LOCALE, isValidLocale, getLocaleInfo, getTMDbLanguage, createT } from './i18n-config'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('locale')?.value ?? ''
  return isValidLocale(raw) ? raw : DEFAULT_LOCALE
}

export async function getMessages(locale: Locale): Promise<Messages> {
  const mod = await import(`../../messages/${locale}.json`)
  return mod.default as Messages
}

export async function getTranslations() {
  const locale = await getLocale()
  const messages = await getMessages(locale)
  return { locale, messages, t: createT(messages) }
}
