import { cookies } from 'next/headers'
import type { TMDbMovie, TMDbMovieDetail, TMDbSearchResult, TMDbPerson, TMDbPersonCredits, TMDbVideo, TrailerItem } from './types'
import { isValidLocale, getTMDbLanguage, DEFAULT_LOCALE } from './i18n-config'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.TMDB_API_KEY

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

async function getActiveTMDbLanguage(): Promise<string> {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get('locale')?.value ?? ''
    const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE
    return getTMDbLanguage(locale)
  } catch {
    return 'tr-TR'
  }
}

export function getPosterUrl(path: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const lang = await getActiveTMDbLanguage()
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('language', lang)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      accept: 'application/json',
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`TMDb API error: ${res.status}`)
  return res.json()
}

// Video çekiminde dil filtresi olmadan — Türkçe filtresi fragmanları kaçırıyor
async function tmdbFetchVideos<T>(endpoint: string): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('include_video_language', 'tr,en,null')

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      accept: 'application/json',
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`TMDb API error: ${res.status}`)
  return res.json()
}

export async function getPopularMovies(page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/movie/popular', { page: String(page) })
}

export async function getPopularSeries(page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/tv/popular', { page: String(page) })
}

export async function getTrendingAll(): Promise<TMDbSearchResult> {
  return tmdbFetch('/trending/all/week')
}

export async function getMovieDetail(id: number): Promise<TMDbMovieDetail> {
  return tmdbFetch(`/movie/${id}`, { append_to_response: 'credits,videos,external_ids' })
}

export async function getSeriesDetail(id: number): Promise<TMDbMovieDetail> {
  return tmdbFetch(`/tv/${id}`, { append_to_response: 'credits,videos,external_ids' })
}

export async function getMovieMini(id: number): Promise<TMDbMovieDetail> {
  return tmdbFetch(`/movie/${id}`)
}

export async function getMoviesByIds(ids: number[]): Promise<any[]> {
  const results = await Promise.all(
    ids.map(id =>
      tmdbFetch(`/movie/${id}`).then((m: any) => ({
        id:             m.id,
        title:          m.title,
        original_title: m.original_title,
        overview:       m.overview,
        poster_path:    m.poster_path,
        release_date:   m.release_date,
        vote_average:   m.vote_average,
        vote_count:     m.vote_count,
        popularity:     m.popularity,
        genre_ids:      (m.genres ?? []).map((g: any) => g.id),
      })).catch(() => null)
    )
  )
  return results.filter(Boolean)
}

export async function getSeriesMini(id: number): Promise<TMDbMovieDetail> {
  return tmdbFetch(`/tv/${id}`)
}

export async function searchMulti(query: string, page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/search/multi', { query, page: String(page) })
}

export async function getTopRatedMovies(page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/movie/top_rated', { page: String(page) })
}

export async function getTopRatedSeries(page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/tv/top_rated', { page: String(page) })
}

export async function discoverMovies(params: {
  page?: number
  genre?: string
  year?: string
  maxYear?: string
  minRating?: string
  sortBy?: string
  provider?: string
  watchRegion?: string
  keywords?: string
  language?: string
  excludeLanguage?: string
  maxRuntime?: string
}): Promise<TMDbSearchResult> {
  const p: Record<string, string> = { page: String(params.page ?? 1) }
  if (params.genre) p['with_genres'] = params.genre
  if (params.year) p['primary_release_year'] = params.year
  if (params.maxYear) p['primary_release_date.lte'] = `${params.maxYear}-12-31`
  if (params.minRating) p['vote_average.gte'] = params.minRating
  if (params.minRating) p['vote_count.gte'] = '50'
  if (params.provider) {
    p['with_watch_providers'] = params.provider
    p['watch_region'] = params.watchRegion ?? 'TR'
  }
  if (params.keywords)        p['with_keywords']            = params.keywords
  if (params.language)        p['with_original_language']   = params.language
  if (params.excludeLanguage) p['without_original_language'] = params.excludeLanguage
  if (params.maxRuntime)      p['with_runtime.lte']          = params.maxRuntime
  p['sort_by'] = params.sortBy ?? 'popularity.desc'
  return tmdbFetch('/discover/movie', p)
}

export async function discoverSeries(params: {
  page?: number
  genre?: string
  year?: string
  maxYear?: string
  minRating?: string
  sortBy?: string
  provider?: string
  watchRegion?: string
  keywords?: string
  language?: string
  excludeLanguage?: string
  seriesType?: string
}): Promise<TMDbSearchResult> {
  const p: Record<string, string> = { page: String(params.page ?? 1) }
  if (params.genre) p['with_genres'] = params.genre
  if (params.year) p['first_air_date_year'] = params.year
  if (params.maxYear) p['first_air_date.lte'] = `${params.maxYear}-12-31`
  if (params.minRating) p['vote_average.gte'] = params.minRating
  if (params.minRating) p['vote_count.gte'] = '50'
  if (params.provider) {
    p['with_watch_providers'] = params.provider
    p['watch_region'] = params.watchRegion ?? 'TR'
  }
  if (params.keywords)        p['with_keywords']             = params.keywords
  if (params.language)        p['with_original_language']    = params.language
  if (params.excludeLanguage) p['without_original_language'] = params.excludeLanguage
  if (params.seriesType)      p['with_type']                 = params.seriesType
  p['sort_by'] = params.sortBy ?? 'popularity.desc'
  return tmdbFetch('/discover/tv', p)
}

export interface StreamingProvider {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}

async function fetchProviderList(type: 'movie' | 'tv', region = 'TR'): Promise<StreamingProvider[]> {
  try {
    const url = `${BASE_URL}/watch/providers/${type}?watch_region=${region}&language=tr-TR`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}`, accept: 'application/json' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data: { results: StreamingProvider[] } = await res.json()
    return (data.results ?? []).sort((a, b) => a.display_priority - b.display_priority).slice(0, 25)
  } catch {
    return []
  }
}

export async function getMovieProviderList(region = 'TR'): Promise<StreamingProvider[]> {
  return fetchProviderList('movie', region)
}

export async function getTVProviderList(region = 'TR'): Promise<StreamingProvider[]> {
  return fetchProviderList('tv', region)
}

export async function getSimilarMovies(id: number): Promise<TMDbSearchResult> {
  return tmdbFetch(`/movie/${id}/similar`)
}

export async function getSimilarSeries(id: number): Promise<TMDbSearchResult> {
  return tmdbFetch(`/tv/${id}/similar`)
}

export async function getPersonDetail(id: number): Promise<TMDbPerson> {
  return tmdbFetch(`/person/${id}`)
}

export async function getPersonCredits(id: number): Promise<TMDbPersonCredits> {
  return tmdbFetch(`/person/${id}/combined_credits`)
}

export function getProfileUrl(path: string | null, size: 'w185' | 'w342' | 'h632' = 'w342') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function getMediaTitle(media: TMDbMovie): string {
  return media.title || media.name || 'Başlık Yok'
}

export function getMediaDate(media: TMDbMovie): string {
  return media.release_date || media.first_air_date || ''
}

export function getMediaYear(media: TMDbMovie): string {
  const date = getMediaDate(media)
  return date ? date.substring(0, 4) : ''
}

export async function getTrendingMovies(): Promise<TMDbSearchResult> {
  return tmdbFetch('/trending/movie/week')
}

export async function getTrendingTV(): Promise<TMDbSearchResult> {
  return tmdbFetch('/trending/tv/week')
}

export async function getUpcomingMovies(page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/movie/upcoming', { page: String(page) })
}

export async function getUpcomingTV(page = 1): Promise<TMDbSearchResult> {
  const today = new Date().toISOString().split('T')[0]
  const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  return tmdbFetch('/discover/tv', {
    page: String(page),
    'first_air_date.gte': today,
    'first_air_date.lte': future,
    sort_by: 'first_air_date.asc',
    'vote_count.gte': '3',
    'with_original_language': 'en|tr|ko|ja|fr|de|es',
  })
}

export async function getNowPlayingMovies(page = 1, region = 'TR'): Promise<TMDbSearchResult> {
  return tmdbFetch('/movie/now_playing', { page: String(page), region })
}

export async function getOnAirTV(page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/tv/on_the_air', { page: String(page) })
}

export async function searchPeople(query: string, page = 1): Promise<{ results: any[]; total_results: number; total_pages: number }> {
  return tmdbFetch('/search/person', { query, page: String(page) })
}

export async function discoverMovieRaw(params: Record<string, string>, page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/discover/movie', { ...params, page: String(page) })
}

export async function discoverTVRaw(params: Record<string, string>, page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/discover/tv', { ...params, page: String(page) })
}

export async function getTopRatedMoviesRaw(params: Record<string, string>, page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/movie/top_rated', { ...params, page: String(page) })
}

export async function getTopRatedTVRaw(params: Record<string, string>, page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/tv/top_rated', { ...params, page: String(page) })
}

export interface WatchProvider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}

export interface WatchProviderResult {
  flatrate?: WatchProvider[]
  rent?: WatchProvider[]
  buy?: WatchProvider[]
  free?: WatchProvider[]
  link?: string
}

async function fetchWatchProviders(endpoint: string): Promise<Record<string, WatchProviderResult> | null> {
  const url = new URL(`${BASE_URL}${endpoint}`)
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_KEY}`, accept: 'application/json' },
    next: { revalidate: 86400 },
  })
  if (!res.ok) return null
  const data: { results?: Record<string, WatchProviderResult> } = await res.json()
  return data.results ?? null
}

export async function getMovieWatchProviders(id: number): Promise<Record<string, WatchProviderResult> | null> {
  return fetchWatchProviders(`/movie/${id}/watch/providers`).catch(() => null)
}

export async function getTVWatchProviders(id: number): Promise<Record<string, WatchProviderResult> | null> {
  return fetchWatchProviders(`/tv/${id}/watch/providers`).catch(() => null)
}

export interface TMDbEpisode {
  id: number
  episode_number: number
  name: string
  overview: string
  air_date: string | null
  still_path: string | null
  runtime: number | null
}

export interface TMDbSeason {
  id: number
  season_number: number
  name: string
  episode_count: number
  poster_path: string | null
  air_date: string | null
  episodes: TMDbEpisode[]
}

export async function getSeasonDetail(seriesId: number, seasonNumber: number): Promise<TMDbSeason> {
  return tmdbFetch(`/tv/${seriesId}/season/${seasonNumber}`)
}

export async function getAiringTodayTV(page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/tv/airing_today', { page: String(page) })
}

export async function getMovieVideos(id: number): Promise<{ results: TMDbVideo[] }> {
  try {
    return await tmdbFetchVideos(`/movie/${id}/videos`)
  } catch {
    return { results: [] }
  }
}

export async function getTVVideos(id: number): Promise<{ results: TMDbVideo[] }> {
  try {
    return await tmdbFetchVideos(`/tv/${id}/videos`)
  } catch {
    return { results: [] }
  }
}

function pickBestTrailer(videos: TMDbVideo[]): TMDbVideo | null {
  const yt = videos.filter(v => v.site === 'YouTube')
  return (
    yt.find(v => v.type === 'Trailer' && v.official) ||
    yt.find(v => v.type === 'Trailer') ||
    yt.find(v => v.type === 'Teaser' && v.official) ||
    yt.find(v => v.type === 'Teaser') ||
    yt[0] ||
    null
  )
}

export async function getTrailersForMovies(
  items: TMDbMovie[],
  type: 'film' | 'yakinda'
): Promise<TrailerItem[]> {
  const results = await Promise.all(
    items.slice(0, 40).map(async (item) => {
      const { results: videos } = await getMovieVideos(item.id)
      const trailer = pickBestTrailer(videos)
      if (!trailer) return null
      return {
        id: item.id,
        title: getMediaTitle(item),
        year: getMediaYear(item),
        type,
        poster: getPosterUrl(item.poster_path, 'w342'),
        backdrop: getBackdropUrl(item.backdrop_path, 'w780'),
        trailerKey: trailer.key,
        trailerName: trailer.name,
      } satisfies TrailerItem
    })
  )
  return results.filter(Boolean) as TrailerItem[]
}

export async function getTrailersForTV(items: TMDbMovie[]): Promise<TrailerItem[]> {
  const results = await Promise.all(
    items.slice(0, 40).map(async (item) => {
      const { results: videos } = await getTVVideos(item.id)
      const trailer = pickBestTrailer(videos)
      if (!trailer) return null
      return {
        id: item.id,
        title: getMediaTitle(item),
        year: getMediaYear(item),
        type: 'dizi' as const,
        poster: getPosterUrl(item.poster_path, 'w342'),
        backdrop: getBackdropUrl(item.backdrop_path, 'w780'),
        trailerKey: trailer.key,
        trailerName: trailer.name,
      } satisfies TrailerItem
    })
  )
  return results.filter(Boolean) as TrailerItem[]
}

export interface TMDbCompany {
  id: number
  name: string
  description: string
  headquarters: string
  homepage: string
  logo_path: string | null
  origin_country: string
  parent_company: { id: number; name: string; logo_path: string | null } | null
}

export interface TMDbPersonExternalIds {
  imdb_id: string | null
  instagram_id: string | null
  twitter_id: string | null
  wikidata_id: string | null
}

export async function getPersonExternalIds(id: number): Promise<TMDbPersonExternalIds> {
  return tmdbFetch(`/person/${id}/external_ids`)
}

export async function getCompanyDetail(id: number): Promise<TMDbCompany> {
  return tmdbFetch(`/company/${id}`)
}

export async function getCompanyMovies(id: number, page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/discover/movie', {
    with_companies: String(id),
    sort_by: 'popularity.desc',
    page: String(page),
  })
}

export async function getPopularPeople(): Promise<{ results: Array<{ id: number; name: string; profile_path: string | null; known_for_department: string; popularity: number }> }> {
  return tmdbFetch('/person/popular')
}

export async function getCompanyTV(id: number, page = 1): Promise<TMDbSearchResult> {
  return tmdbFetch('/discover/tv', {
    with_companies: String(id),
    sort_by: 'popularity.desc',
    page: String(page),
  })
}

export interface TMDbImageResult {
  backdrops: { file_path: string; width: number; height: number; vote_average: number }[]
  posters: { file_path: string; width: number; height: number; vote_average: number }[]
}

export async function getMovieImages(id: number): Promise<TMDbImageResult> {
  return tmdbFetch(`/movie/${id}/images`)
}

export async function getSeriesImages(id: number): Promise<TMDbImageResult> {
  return tmdbFetch(`/tv/${id}/images`)
}

export interface TMDbCollection {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  parts: {
    id: number
    title: string
    release_date: string
    poster_path: string | null
    vote_average: number
    overview: string
  }[]
}

export async function getCollection(id: number): Promise<TMDbCollection> {
  return tmdbFetch(`/collection/${id}`)
}

export async function getMovieKeywords(id: number): Promise<{ keywords: { id: number; name: string }[] }> {
  try { return await tmdbFetch(`/movie/${id}/keywords`) } catch { return { keywords: [] } }
}

export async function getSeriesKeywords(id: number): Promise<{ results: { id: number; name: string }[] }> {
  try { return await tmdbFetch(`/tv/${id}/keywords`) } catch { return { results: [] } }
}

export async function getMovieCertification(id: number): Promise<string | null> {
  try {
    const data: { results: { iso_3166_1: string; release_dates: { certification: string; type: number }[] }[] } =
      await tmdbFetch(`/movie/${id}/release_dates`)
    const tr = data.results?.find(r => r.iso_3166_1 === 'TR')
    if (tr) { const c = tr.release_dates.find(d => d.certification); if (c?.certification) return c.certification }
    const us = data.results?.find(r => r.iso_3166_1 === 'US')
    if (us) { const c = us.release_dates.find(d => d.certification); if (c?.certification) return c.certification }
    return null
  } catch { return null }
}

export async function getSeriesCertification(id: number): Promise<string | null> {
  try {
    const data: { results: { iso_3166_1: string; rating: string }[] } =
      await tmdbFetch(`/tv/${id}/content_ratings`)
    const tr = data.results?.find(r => r.iso_3166_1 === 'TR')
    if (tr?.rating) return tr.rating
    const us = data.results?.find(r => r.iso_3166_1 === 'US')
    if (us?.rating) return us.rating
    return null
  } catch { return null }
}

export async function getPersonImages(id: number): Promise<{ profiles: { file_path: string; width: number; height: number }[] }> {
  try { return await tmdbFetch(`/person/${id}/images`) } catch { return { profiles: [] } }
}
