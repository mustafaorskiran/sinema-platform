import { getUpcomingMovies, getOnAirTV, getAiringTodayTV, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import type { TMDbMovie } from '@/lib/types'
import type { Metadata } from 'next'
import YayinTakvimiClient from './YayinTakvimiClient'

export const metadata: Metadata = {
  title: 'Yayın Takvimi — Yakında & Bu Hafta',
  description: 'Yakında çıkacak filmler, bu hafta yayındaki diziler ve bugün yayınlananlar.',
}

export const revalidate = 3600

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function YayinTakvimiPage() {
  const [upcomingData, onAirData, todayData] = await Promise.all([
    getUpcomingMovies(1).catch(() => ({ results: [] as TMDbMovie[] })),
    getOnAirTV(1).catch(() => ({ results: [] as TMDbMovie[] })),
    getAiringTodayTV(1).catch(() => ({ results: [] as TMDbMovie[] })),
  ])

  const upcoming = (upcomingData.results ?? []).map(m => ({
    id: m.id,
    title: getMediaTitle(m),
    poster: getPosterUrl(m.poster_path, 'w342'),
    date: m.release_date ?? '',
    dateFormatted: formatDate(m.release_date),
    daysUntil: daysUntil(m.release_date),
    rating: m.vote_average,
    type: 'film' as const,
  })).sort((a, b) => a.date.localeCompare(b.date))

  const onAir = (onAirData.results ?? []).map(s => ({
    id: s.id,
    title: getMediaTitle(s),
    poster: getPosterUrl(s.poster_path, 'w342'),
    date: s.first_air_date ?? '',
    dateFormatted: formatDate(s.first_air_date),
    daysUntil: null,
    rating: s.vote_average,
    type: 'dizi' as const,
  })).sort((a, b) => b.rating - a.rating)

  const today = (todayData.results ?? []).map(s => ({
    id: s.id,
    title: getMediaTitle(s),
    poster: getPosterUrl(s.poster_path, 'w342'),
    date: s.first_air_date ?? '',
    dateFormatted: formatDate(s.first_air_date),
    daysUntil: null,
    rating: s.vote_average,
    type: 'dizi' as const,
  })).sort((a, b) => b.rating - a.rating)

  return <YayinTakvimiClient upcoming={upcoming} onAir={onAir} today={today} />
}
