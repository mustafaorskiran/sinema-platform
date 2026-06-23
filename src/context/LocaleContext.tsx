'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Locale } from '@/lib/i18n-config'

type Messages = Record<string, Record<string, string>>

interface LocaleContextValue {
  locale: Locale
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'tr',
  t: (key) => key,
})

function createT(messages: Messages) {
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

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: ReactNode
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: createT(messages) }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext)
}
