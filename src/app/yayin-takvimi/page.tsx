import {
  getUpcomingMovies, getNowPlayingMovies,
  getOnAirTV, getAiringTodayTV, getUpcomingTV,
  getPosterUrl, getMediaTitle,
} from '@/lib/tmdb'
import type { TMDbMovie } from '@/lib/types'
import type { Metadata } from 'next'
import YayinTakvimiClient from './YayinTakvimiClient'

export const metadata: Metadata = {
  title: 'Yayın Takvimi — Yakında & Bu Hafta',
  description: 'Yakında çıkacak filmler ve diziler, bu hafta yayındakiler.',
}

export const revalidate = 3600

export interface ScheduleItem {
  id: number
  title: string
  poster: string | null
  date: string
  rating: number
  genreIds: number[]
  type: 'film' | 'dizi'
}

function dedup<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>()
  return items.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true })
}

function toScheduleItem(m: TMDbMovie, type: 'film' | 'dizi'): ScheduleItem {
  const date = type === 'film'
    ? (m.release_date ?? '')
    : ((m as any).first_air_date ?? '')
  return {
    id: m.id,
    title: getMediaTitle(m),
    poster: getPosterUrl(m.poster_path, 'w342'),
    date,
    rating: m.vote_average ?? 0,
    genreIds: (m as any).genre_ids ?? [],
    type,
  }
}

export default async function YayinTakvimiPage() {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // Monday of current week
  const weekStart = new Date(now)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // 1 year from now
  const oneYear = new Date(now)
  oneYear.setFullYear(oneYear.getFullYear() + 1)
  const oneYearStr = oneYear.toISOString().split('T')[0]

  const [upcomingRaw, nowPlayingRaw, onAirRaw, todayRaw, upcomingTVRaw] = await Promise.all([
    Promise.all([1,2,3,4,5].map(p => getUpcomingMovies(p).catch(() => ({ results: [] as TMDbMovie[] })))),
    Promise.all([1,2,3].map(p => getNowPlayingMovies(p).catch(() => ({ results: [] as TMDbMovie[] })))),
    Promise.all([1,2,3].map(p => getOnAirTV(p).catch(() => ({ results: [] as TMDbMovie[] })))),
    Promise.all([1,2,3].map(p => getAiringTodayTV(p).catch(() => ({ results: [] as TMDbMovie[] })))),
    Promise.all([1,2,3,4,5].map(p => getUpcomingTV(p).catch(() => ({ results: [] as TMDbMovie[] })))),
  ])

  const upcomingMovies  = dedup(upcomingRaw.flatMap(d => d.results ?? []))
  const nowPlayingAll   = dedup(nowPlayingRaw.flatMap(d => d.results ?? []))
  const onAirAll        = dedup(onAirRaw.flatMap(d => d.results ?? []))
  const todaySeriesAll  = dedup(todayRaw.flatMap(d => d.results ?? []))
  const upcomingTVAll   = dedup(upcomingTVRaw.flatMap(d => d.results ?? []))

  // FİLM tab — this week (Mon → yesterday) + upcoming (today → +1 year)
  const thisWeekMovies = nowPlayingAll.filter(m => {
    const d = m.release_date ?? ''
    return d >= weekStartStr && d < todayStr
  })
  const upcomingFilms = upcomingMovies.filter(m => {
    const d = m.release_date ?? ''
    return d >= todayStr && d <= oneYearStr
  })
  const filmItems = dedup([...thisWeekMovies, ...upcomingFilms]).map(m => toScheduleItem(m, 'film'))

  // TV tab — series premiering this week + upcoming (today → +1 year)
  const thisWeekSeries = onAirAll.filter(s => {
    const d = (s as any).first_air_date ?? ''
    return d >= weekStartStr && d < todayStr
  })
  const upcomingSeriesFiltered = upcomingTVAll.filter(s => {
    const d = (s as any).first_air_date ?? ''
    return d >= todayStr && d <= oneYearStr
  })
  const tvItems = dedup([...thisWeekSeries, ...upcomingSeriesFiltered]).map(s => toScheduleItem(s, 'dizi'))

  // TV BÖLÜMÜ tab — airing today
  const tvBolumItems = todaySeriesAll.map(s => toScheduleItem(s, 'dizi'))

  return (
    <YayinTakvimiClient
      filmItems={filmItems}
      tvItems={tvItems}
      tvBolumItems={tvBolumItems}
    />
  )
}
