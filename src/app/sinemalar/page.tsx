import Link from 'next/link'
import { getNowPlayingMovies, getUpcomingMovies, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import type { Metadata } from 'next'
import SinemalarClient from './SinemalarClient'

export const metadata: Metadata = { title: 'Sinemalar & Vizyonda' }

// Büyük Türkiye sinema zincirleri
const SINEMA_ZINCIRLERI = [
  { name: 'Cinemaximum', logo: '🎬', url: 'https://www.cinemaximum.com.tr', desc: 'Mars Entertainment grubu' },
  { name: 'CGV', logo: '🎭', url: 'https://www.cgv.com.tr', desc: 'Uluslararası zincir' },
  { name: 'CineLux', logo: '🎪', url: 'https://www.cinelux.com.tr', desc: 'Lüks sinema deneyimi' },
  { name: 'Cinemarine', logo: '⚓', url: 'https://www.cinemarine.com.tr', desc: 'Fethiye & Datça' },
  { name: 'Özgür Sineması', logo: '🌟', url: 'https://www.ozgursinemasi.com', desc: 'Bağımsız sinema' },
  { name: 'Biletinial', logo: '🎟️', url: 'https://biletinial.com/tr-tr/sinema', desc: 'Tüm sinemalar bilet' },
  { name: 'Beyazperde', logo: '📽️', url: 'https://www.beyazperde.com/sinemalar/', desc: 'Seans & sinema rehberi' },
  { name: 'Sinemalar.com', logo: '🏢', url: 'https://www.sinemalar.com', desc: 'Türkiye sinema rehberi' },
]

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysUntil(dateStr: string) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return null
  if (diff === 1) return '1 gün kaldı'
  if (diff < 7) return `${diff} gün kaldı`
  if (diff < 30) return `${Math.ceil(diff / 7)} hafta kaldı`
  return `${Math.ceil(diff / 30)} ay kaldı`
}

export default async function SinemalarPage() {
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
        <h1 className="text-3xl font-bold text-white">Sinemalar & Vizyonda</h1>
        <p className="text-[--text-secondary] text-sm mt-1">Türkiye'de vizyondaki ve yakında çıkacak filmler</p>
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
          daysUntil: daysUntil(m.release_date ?? ''),
          formattedDate: formatDate(m.release_date ?? ''),
        }))}
        zincirleri={SINEMA_ZINCIRLERI}
      />
    </div>
  )
}
