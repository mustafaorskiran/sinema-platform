import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
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

  const footerText = (messages.footer?.rights as string) ?? '© 2025 SineMa'

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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div>
                <p className="font-semibold text-white mb-3">{t('footer.exploreHeading')}</p>
                <ul className="space-y-2">
                  <li><a href="/filmler" className="hover:text-white transition-colors">{t('nav.films')}</a></li>
                  <li><a href="/diziler" className="hover:text-white transition-colors">{t('nav.series')}</a></li>
                  <li><a href="/top10" className="hover:text-white transition-colors">{t('nav.megaMenu.films.top10')}</a></li>
                  <li><a href="/evren" className="hover:text-white transition-colors">{t('nav.megaMenu.explore.cinemaUniverses')}</a></li>
                  <li><a href="/versus" className="hover:text-white transition-colors">{t('nav.megaMenu.explore.filmVsFilm')}</a></li>
                  <li><a href="/yakinda" className="hover:text-white transition-colors">{t('footer.upcomingReleases')}</a></li>
                  <li><a href="/kutu-ofis" className="hover:text-white transition-colors">{t('nav.megaMenu.films.boxOffice')}</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white mb-3">{t('footer.communityHeading')}</p>
                <ul className="space-y-2">
                  <li><a href="/liderlik" className="hover:text-white transition-colors">{t('footer.leaderboard')}</a></li>
                  <li><a href="/haftalik" className="hover:text-white transition-colors">{t('nav.megaMenu.explore.weeklyDigest')}</a></li>
                  <li><a href="/forum" className="hover:text-white transition-colors">{t('nav.forum')}</a></li>
                  <li><a href="/alintilar" className="hover:text-white transition-colors">{t('nav.megaMenu.explore.quotes')}</a></li>
                  <li><a href="/haberler" className="hover:text-white transition-colors">{t('nav.megaMenu.films.news')}</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white mb-3">{t('footer.userHeading')}</p>
                <ul className="space-y-2">
                  <li><a href="/akis" className="hover:text-white transition-colors">{t('footer.myFeedLink')}</a></li>
                  <li><a href="/izleme-listem" className="hover:text-white transition-colors">{t('nav.myWatchlist')}</a></li>
                  <li><a href="/dizi-takip" className="hover:text-white transition-colors">{t('nav.seriesTracker')}</a></li>
                  <li><a href="/gunluk" className="hover:text-white transition-colors">{t('footer.myDiary')}</a></li>
                  <li><a href={`/ozet/${new Date().getFullYear()}`} className="hover:text-white transition-colors">{t('footer.yearRecap')}</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white mb-3">{t('footer.aboutHeading')}</p>
                <ul className="space-y-2">
                  <li><a href="/hakkinda" className="hover:text-white transition-colors">{t('footer.aboutUs')}</a></li>
                  <li><a href="/gizlilik" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                  <li><a href="/kullanim-sartlari" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
                </ul>
              </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="font-bold text-white">Sinezon</p>
              <p>{footerText}</p>
            </div>
          </footer>
          <BottomNav user={user} />
        </LocaleProvider>
      </body>
    </html>
  )
}
