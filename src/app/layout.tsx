import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { createClient } from '@/lib/supabase/server'
import { LocaleProvider } from '@/context/LocaleContext'
import { getLocale, getMessages } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'
const SITE_NAME = 'Sinezon'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sinezon — Film & Dizi Dünyası',
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Film ve dizi puan ver, yorum yap, listeler oluştur. Türkçe sinema topluluğu.',
  manifest: '/manifest.webmanifest',
  openGraph: {
    siteName: SITE_NAME,
    locale: 'tr_TR',
    type: 'website',
    title: 'Sinezon — Film & Dizi Dünyası',
    description: 'Film ve dizi puan ver, yorum yap, listeler oluştur. Türkçe sinema topluluğu.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sinezon',
    title: 'Sinezon — Film & Dizi Dünyası',
    description: 'Film ve dizi puan ver, yorum yap, listeler oluştur. Türkçe sinema topluluğu.',
  },
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_NAME,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages(locale)

  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single()
      user = { id: data.user.id, email: data.user.email, username: profile?.username }
    }
  } catch {}

  const footerText = (messages.footer?.rights as string) ?? '© 2025 SineMa'

  return (
    <html lang={locale} className="h-full dark">
      <head>
        <meta name="theme-color" content="#080A0F" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={locale} messages={messages}>
          <ServiceWorkerRegistration />
          <Navbar user={user} />
          <main className="flex-1 pb-bottom-nav md:pb-0">{children}</main>
          <footer className="hidden md:block mt-16 py-8 text-center text-sm text-[--text-secondary]" style={{ borderTop: '1px solid var(--border)' }}>
            <p>{footerText}</p>
          </footer>
          <BottomNav user={user} />
        </LocaleProvider>
      </body>
    </html>
  )
}
