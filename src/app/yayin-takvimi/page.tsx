import { getUpcomingMovies, getOnAirTV, getAiringTodayTV, getUpcomingTV, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import type { TMDbMovie } from '@/lib/types'
import type { Metadata } from 'next'
import YayinTakvimiClient from './YayinTakvimiClient'

export const metadata: Metadata = {
  title: 'Yayın Takvimi — Yakında & Bu Hafta',
  description: 'Yakında çıkacak filmler ve diziler, bu hafta yayındakiler ve bugün yayınlananlar.',
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

function dedup<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>()
  return items.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true })
}

export default async function YayinTakvimiPage() {
  const [upcomingRaw, onAirRaw, todayRaw, upcomingTVRaw] = await Promise.all([
    Promise.all([1,2,3,4,5].map(p => getUpcomingMovies(p).catch(() => ({ results: [] as TMDbMovie[] })))),
    Promise.all([1,2,3,4,5].map(p => getOnAirTV(p).catch(() => ({ results: [] as TMDbMovie[] })))),
    Promise.all([1,2,3].map(p => getAiringTodayTV(p).catch(() => ({ results: [] as TMDbMovie[] })))),
    Promise.all([1,2,3,4,5].map(p => getUpcomingTV(p).catch(() => ({ results: [] as TMDbMovie[] })))),
  ])

  const upcomingMovies = dedup(upcomingRaw.flatMap(d => d.results ?? []))
  const onAirSeries   = dedup(onAirRaw.flatMap(d => d.results ?? []))
  const todaySeries   = dedup(todayRaw.flatMap(d => d.results ?? []))
  const upcomingTV    = dedup(upcomingTVRaw.flatMap(d => d.results ?? []))

  const upcoming = upcomingMovies.map(m => ({
    id: m.id,
    title: getMediaTitle(m),
    poster: getPosterUrl(m.poster_path, 'w342'),
    date: m.release_date ?? '',
    dateFormatted: formatDate(m.release_date),
    daysUntil: daysUntil(m.release_date),
    rating: m.vote_average,
    type: 'film' as const,
  })).sort((a, b) => a.date.localeCompare(b.date))

  const onAir = onAirSeries.map(s => ({
    id: s.id,
    title: getMediaTitle(s),
    poster: getPosterUrl(s.poster_path, 'w342'),
    date: s.first_air_date ?? '',
    dateFormatted: formatDate(s.first_air_date),
    daysUntil: null,
    rating: s.vote_average,
    type: 'dizi' as const,
  })).sort((a, b) => b.rating - a.rating)

  const today = todaySeries.map(s => ({
    id: s.id,
    title: getMediaTitle(s),
    poster: getPosterUrl(s.poster_path, 'w342'),
    date: s.first_air_date ?? '',
    dateFormatted: formatDate(s.first_air_date),
    daysUntil: null,
    rating: s.vote_average,
    type: 'dizi' as const,
  })).sort((a, b) => b.rating - a.rating)

  const upcomingDiziler = upcomingTV.map(s => ({
    id: s.id,
    title: getMediaTitle(s),
    poster: getPosterUrl(s.poster_path, 'w342'),
    date: (s as any).first_air_date ?? '',
    dateFormatted: formatDate((s as any).first_air_date),
    daysUntil: daysUntil((s as any).first_air_date),
    rating: s.vote_average,
    type: 'dizi' as const,
  })).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <YayinTakvimiClient
      upcoming={upcoming}
      onAir={onAir}
      today={today}
      upcomingDiziler={upcomingDiziler}
    />
  )
}
