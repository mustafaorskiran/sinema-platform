import Link from 'next/link'
import { getNowPlayingMovies, getUpcomingMovies, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'
import SinemalarClient from './SinemalarClient'

export const metadata: Metadata = { title: 'Sinemalar & Vizyonda' }

// Büyük Türkiye sinema zincirleri — 2026-07 itibarıyla doğrulanmış, çalışan
// adresler. Cinemaximum + CGV, Paribu Cineverse markası altında birleşti
// (eski cinemaximum.com.tr / cgv.com.tr artık çözümlenmiyor). CineLux
// (sertifika uyuşmazlığı) ve Özgür Sineması (DNS çözülmüyor) kaldırıldı.
const SINEMA_ZINCIRLERI = [
  { name: 'Paribu Cineverse', logo: '🎬', url: 'https://www.paribucineverse.com', desc: 'Eski Cinemaximum + CGV, Türkiye\'nin en büyük zinciri' },
  { name: 'Cinens', logo: '🎪', url: 'https://www.cinens.com', desc: 'Çok şehirli sinema zinciri' },
  { name: 'Cinemarine', logo: '⚓', url: 'https://www.cinemarine.com.tr', desc: '11 ilde 15 salon' },
  { name: 'Biletinial', logo: '🎟️', url: 'https://biletinial.com/tr-tr/sinema', desc: 'Tüm sinemalar bilet' },
  { name: 'Beyazperde', logo: '📽️', url: 'https://www.beyazperde.com/sinemalar/', desc: 'Seans & sinema rehberi' },
  { name: 'Sinemalar.com', logo: '🏢', url: 'https://www.sinemalar.com', desc: 'Türkiye sinema rehberi' },
]

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysUntil(dateStr: string, t: (key: string, params?: Record<string, string | number>) => string) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return null
  if (diff === 1) return t('country.oneDayLeft')
  if (diff < 7) return t('country.daysLeft', { count: diff })
  if (diff < 30) return t('country.weeksLeft', { count: Math.ceil(diff / 7) })
  return t('country.monthsLeft', { count: Math.ceil(diff / 30) })
}

export default async function SinemalarPage() {
  const { t } = await getTranslations()
  const [nowData, upcomingData] = await Promise.all([
    getNowPlayingMovies(1, 'TR').catch(() => ({ results: [] })),
    getUpcomingMovies(1).catch(() => ({ results: [] })),
  ])

  const nowPlaying = (nowData.results ?? []).slice(0, 24)
  const upcoming = (upcomingData.results ?? [])
    .filter(m => m.release_date && new Date(m.release_date) > new Date())
    .sort((a, b) => new Date(a.release_date!).getTime() - new Date(b.release_date!).getTime())
    .slice(0, 24)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{t('country.sinemalarVizyonda')}</h1>
        <p className="text-[--text-secondary] text-sm mt-1">{t('country.sinemalarSubtitle')}</p>
      </div>

      <SinemalarClient
        nowPlaying={nowPlaying.map(m => ({
          id: m.id,
          title: getMediaTitle(m),
          year: getMediaYear(m),
          poster: getPosterUrl(m.poster_path, 'w342'),
          rating: m.vote_average,
          release_date: m.release_date ?? '',
        }))}
        upcoming={upcoming.map(m => ({
          id: m.id,
          title: getMediaTitle(m),
          year: getMediaYear(m),
          poster: getPosterUrl(m.poster_path, 'w342'),
          rating: m.vote_average,
          release_date: m.release_date ?? '',
          daysUntil: daysUntil(m.release_date ?? '', t),
          formattedDate: formatDate(m.release_date ?? ''),
        }))}
        zincirleri={SINEMA_ZINCIRLERI}
      />
    </div>
  )
}
