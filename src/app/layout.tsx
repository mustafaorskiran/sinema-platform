import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Logo from '@/components/Logo'
import BottomNav from '@/components/BottomNav'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import { createClient } from '@/lib/supabase/server'
import { LocaleProvider } from '@/context/LocaleContext'
import { getLocale, getMessages, createT } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'
const SITE_NAME = 'Sinezon'

const HOME_TITLE = 'Sinezon — Film ve Dizi Yorumları, Puanlama'
const HOME_DESC = 'Film ve dizi yorumları oku, puan ver, listeler oluştur. Türkiye\'nin Türkçe sinema topluluğu — IMDb ve Letterboxd tarzı film puanlama platformu.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESC,
  keywords: [
    'film yorumları', 'dizi yorumları', 'film puanla', 'dizi puanla',
    'en iyi filmler', 'en iyi diziler', 'film önerisi', 'sinema topluluğu',
    'film izleme listesi', 'Türkçe film platformu',
  ],
  manifest: '/manifest.json',
  openGraph: {
    siteName: SITE_NAME,
    locale: 'tr_TR',
    type: 'website',
    title: HOME_TITLE,
    description: HOME_DESC,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sinezon',
    title: HOME_TITLE,
    description: HOME_DESC,
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
    'robots': 'index, follow, noai, noimageai',
  },
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages(locale)
  const t = createT(messages)

  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, is_admin')
        .eq('id', data.user.id)
        .single()
      user = { id: data.user.id, email: data.user.email, username: profile?.username, is_admin: profile?.is_admin ?? false }
    }
  } catch {}

  const footerText = (messages.footer?.rights as string) ?? '© 2025 Sinezon'

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    sameAs: [],
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'tr',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/arama?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang={locale} className="h-full dark">
      <head>
        <meta name="theme-color" content="#080A0F" />
        <link rel="apple-touch-icon" href="/icons/apple-icon.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
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
          <KeyboardShortcuts username={user?.username} />
          <Navbar user={user} />
          <main className="flex-1 pb-bottom-nav md:pb-0">{children}</main>
          <footer className="mt-16 pt-10 pb-24 md:pb-10 text-sm text-[--text-secondary]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Keşif/Topluluk/Kullanıcı bağlantıları artık üst menüde (Keşfet mega-menü) ve
                profil menüsünde gruplu olarak yer alıyor — burada tekrar etmiyoruz. */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
              <p className="font-semibold text-white mb-3">{t('footer.aboutHeading')}</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                <li><a href="/hakkinda" className="hover:text-white transition-colors">{t('footer.aboutUs')}</a></li>
                <li><a href="/premium" className="hover:text-white transition-colors">{t('footer.features')}</a></li>
                <li><a href="/gizlilik" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="/kullanim-sartlari" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              </ul>
            </div>
            <div className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <Logo variant="wordmark" size="sm" />
              <p>{footerText}</p>
            </div>
          </footer>
          <BottomNav user={user} />
        </LocaleProvider>
      </body>
    </html>
  )
}
