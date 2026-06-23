import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import KarsilastirClient from './KarsilastirClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Film Karşılaştır | SineMa' }

interface Props {
  searchParams: Promise<{ a?: string; b?: string; ta?: string; tb?: string }>
}

export default async function KarsilastirPage({ searchParams }: Props) {
  const { a, b, ta = 'film', tb = 'film' } = await searchParams

  const idA = a ? Number(a) : null
  const idB = b ? Number(b) : null

  const [mediaA, mediaB] = await Promise.all([
    idA
      ? (ta === 'dizi' ? getSeriesDetail(idA) : getMovieDetail(idA)).catch(() => null)
      : Promise.resolve(null),
    idB
      ? (tb === 'dizi' ? getSeriesDetail(idB) : getMovieDetail(idB)).catch(() => null)
      : Promise.resolve(null),
  ])

  const itemA = mediaA ? {
    id: mediaA.id,
    type: ta,
    title: getMediaTitle(mediaA),
    year: getMediaYear(mediaA),
    poster: getPosterUrl(mediaA.poster_path, 'w500'),
    rating: mediaA.vote_average,
    voteCount: mediaA.vote_count,
    runtime: mediaA.runtime ?? null,
    episodes: mediaA.number_of_episodes ?? null,
    seasons: mediaA.number_of_seasons ?? null,
    genres: mediaA.genres?.map(g => g.name) ?? [],
    overview: mediaA.overview,
    status: mediaA.status,
    countries: mediaA.production_countries?.map(c => c.name) ?? [],
    companies: mediaA.production_companies?.map(c => c.name) ?? [],
    tagline: mediaA.tagline,
    budget: (mediaA as any).budget ?? null,
    revenue: (mediaA as any).revenue ?? null,
    language: (mediaA as any).original_language ?? null,
  } : null

  const itemB = mediaB ? {
    id: mediaB.id,
    type: tb,
    title: getMediaTitle(mediaB),
    year: getMediaYear(mediaB),
    poster: getPosterUrl(mediaB.poster_path, 'w500'),
    rating: mediaB.vote_average,
    voteCount: mediaB.vote_count,
    runtime: mediaB.runtime ?? null,
    episodes: mediaB.number_of_episodes ?? null,
    seasons: mediaB.number_of_seasons ?? null,
    genres: mediaB.genres?.map(g => g.name) ?? [],
    overview: mediaB.overview,
    status: mediaB.status,
    countries: mediaB.production_countries?.map(c => c.name) ?? [],
    companies: mediaB.production_companies?.map(c => c.name) ?? [],
    tagline: mediaB.tagline,
    budget: (mediaB as any).budget ?? null,
    revenue: (mediaB as any).revenue ?? null,
    language: (mediaB as any).original_language ?? null,
  } : null

  return <KarsilastirClient itemA={itemA} itemB={itemB} />
}
