import {
  getUpcomingMoviesYear, getNowPlayingMovies,
  getOnAirTV, getAiringTodayTV, getUpcomingTVYear,
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

function toScheduleItem(m: TMDbMovie, type: 'film' | 'dizi', overrideDate?: string): ScheduleItem {
  const date = overrideDate ?? (type === 'film'
    ? (m.release_date ?? '')
    : ((m as any).first_air_date ?? ''))
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

// Vercel'de paralel fetch sayısını sınırla — batch'ler halinde çek
async function fetchAllPages<T extends { results?: TMDbMovie[] }>(
  fn: (page: number) => Promise<T>,
  maxPages: number,
  batchSize = 5,
): Promise<TMDbMovie[]> {
  const all: TMDbMovie[] = []
  for (let start = 1; start <= maxPages; start += batchSize) {
    const end = Math.min(start + batchSize - 1, maxPages)
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    const results = await Promise.all(pages.map(p => fn(p).catch(() => ({ results: [] as TMDbMovie[] }))))
    for (const r of results) all.push(...(r.results ?? []))
    // TMDb ilk sayfada total_pages döndürür — eğer gerçek sayfa sayısı daha azsa dur
    if (start === 1) {
      const firstResult = results[0] as any
      const realMax = firstResult?.total_pages ?? maxPages
      if (realMax < maxPages) maxPages = realMax
    }
  }
  return all
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

  // Paralel olarak hepsini çek
  const [
    upcomingMoviesRaw,
    nowPlayingRaw,
    onAirRaw,
    todayRaw,
    upcomingTVRaw,
  ] = await Promise.all([
    // Film: 1 yıllık discover — max 20 sayfa (=400 film)
    fetchAllPages(getUpcomingMoviesYear, 20, 5),
    // Bu hafta vizyondakiler (ek kaynak)
    Promise.all([1,2,3].map(p => getNowPlayingMovies(p).catch(() => ({ results: [] as TMDbMovie[] })))).then(r => r.flatMap(d => d.results ?? [])),
    // TV: yayında olan diziler (bu hafta için)
    Promise.all([1,2,3].map(p => getOnAirTV(p).catch(() => ({ results: [] as TMDbMovie[] })))).then(r => r.flatMap(d => d.results ?? [])),
    // TV BÖLÜMÜ: bugün yayında
    Promise.all([1,2,3,4,5].map(p => getAiringTodayTV(p).catch(() => ({ results: [] as TMDbMovie[] })))).then(r => r.flatMap(d => d.results ?? [])),
    // TV: 1 yıllık discover — max 15 sayfa
    fetchAllPages(getUpcomingTVYear, 15, 5),
  ])

  const upcomingMovies = dedup(upcomingMoviesRaw)
  const nowPlayingAll  = dedup(nowPlayingRaw)
  const onAirAll       = dedup(onAirRaw)
  const todaySeriesAll = dedup(todayRaw)
  const upcomingTVAll  = dedup(upcomingTVRaw)

  // ── FİLM tab ──
  // Bu hafta (Pazartesi → dün) vizyona girenler
  const thisWeekMovies = nowPlayingAll.filter(m => {
    const d = m.release_date ?? ''
    return d >= weekStartStr && d < todayStr
  })
  // Bugün + 1 yıl içinde çıkacaklar
  const upcomingFilms = upcomingMovies.filter(m => {
    const d = m.release_date ?? ''
    return d >= todayStr && d <= oneYearStr
  })
  const filmItems = dedup([...thisWeekMovies, ...upcomingFilms]).map(m => toScheduleItem(m, 'film'))

  // ── TV tab ──
  // Bu hafta premiere olan diziler
  const thisWeekSeries = onAirAll.filter(s => {
    const d = (s as any).first_air_date ?? ''
    return d >= weekStartStr && d < todayStr
  })
  // Bugün + 1 yıl içinde premiere olan diziler
  const upcomingSeriesFiltered = upcomingTVAll.filter(s => {
    const d = (s as any).first_air_date ?? ''
    return d >= todayStr && d <= oneYearStr
  })
  const tvItems = dedup([...thisWeekSeries, ...upcomingSeriesFiltered]).map(s => toScheduleItem(s, 'dizi'))

  // ── TV BÖLÜMÜ tab ──
  // Bugün bölüm yayınlayan diziler — date olarak bugünü kullan (first_air_date değil!)
  const tvBolumItems = todaySeriesAll.map(s => toScheduleItem(s, 'dizi', todayStr))

  return (
    <YayinTakvimiClient
      filmItems={filmItems}
      tvItems={tvItems}
      tvBolumItems={tvBolumItems}
    />
  )
}
