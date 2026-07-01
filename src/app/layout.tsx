import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
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
  manifest: '/manifest.json',
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
          <KeyboardShortcuts username={user?.username} />
          <Navbar user={user} />
          <main className="flex-1 pb-bottom-nav md:pb-0">{children}</main>
          <footer className="mt-16 pt-10 pb-24 md:pb-10 text-sm text-[--text-secondary]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div>
                <p className="font-semibold text-white mb-3">Keşfet</p>
                <ul className="space-y-2">
                  <li><a href="/filmler" className="hover:text-white transition-colors">Filmler</a></li>
                  <li><a href="/diziler" className="hover:text-white transition-colors">Diziler</a></li>
                  <li><a href="/top10" className="hover:text-white transition-colors">🔥 Top 10</a></li>
                  <li><a href="/evren" className="hover:text-white transition-colors">🌌 Sinema Evrenler</a></li>
                  <li><a href="/versus" className="hover:text-white transition-colors">⚔️ Film vs Film</a></li>
                  <li><a href="/yakinda" className="hover:text-white transition-colors">Yakında Çıkacaklar</a></li>
                  <li><a href="/kutu-ofis" className="hover:text-white transition-colors">🎟️ Türkiye Gişe</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white mb-3">Topluluk</p>
                <ul className="space-y-2">
                  <li><a href="/liderlik" className="hover:text-white transition-colors">Liderlik Tablosu</a></li>
                  <li><a href="/haftalik" className="hover:text-white transition-colors">📰 Haftanın Özeti</a></li>
                  <li><a href="/forum" className="hover:text-white transition-colors">Forum</a></li>
                  <li><a href="/alintilar" className="hover:text-white transition-colors">Alıntılar</a></li>
                  <li><a href="/haberler" className="hover:text-white transition-colors">Sinema Haberleri</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white mb-3">Kullanıcı</p>
                <ul className="space-y-2">
                  <li><a href="/akis" className="hover:text-white transition-colors">Akışım</a></li>
                  <li><a href="/izleme-listem" className="hover:text-white transition-colors">İzleme Listem</a></li>
                  <li><a href="/dizi-takip" className="hover:text-white transition-colors">📺 Dizi Takip</a></li>
                  <li><a href="/gunluk" className="hover:text-white transition-colors">Günlüğüm</a></li>
                  <li><a href={`/ozet/${new Date().getFullYear()}`} className="hover:text-white transition-colors">Yıl Özetim</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white mb-3">Hakkında</p>
                <ul className="space-y-2">
                  <li><a href="/hakkinda" className="hover:text-white transition-colors">Hakkımızda</a></li>
                  <li><a href="/gizlilik" className="hover:text-white transition-colors">Gizlilik</a></li>
                  <li><a href="/kullanim-sartlari" className="hover:text-white transition-colors">Kullanım Şartları</a></li>
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
