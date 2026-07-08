import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import {
  getSeriesDetail, getSeriesCertification, getPosterUrl, getBackdropUrl,
} from '@/lib/tmdb'
import { isValidLocale, getTMDbLanguage, DEFAULT_LOCALE } from '@/lib/i18n'

/// Mobil uygulama için dizi detay uç noktası — film/[id] route'unun
/// dizi karşılığı, aynı desen. ?lang= için bkz. film/[id]/route.ts.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-dizi-detail:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const { id } = await params
  const seriesId = Number(id)
  if (!Number.isFinite(seriesId)) {
    return NextResponse.json({ error: 'Geçersiz id' }, { status: 400 })
  }

  const rawLang = req.nextUrl.searchParams.get('lang') ?? ''
  const tmdbLang = getTMDbLanguage(isValidLocale(rawLang) ? rawLang : DEFAULT_LOCALE)

  try {
    const [series, certification] = await Promise.all([
      getSeriesDetail(seriesId, tmdbLang),
      getSeriesCertification(seriesId).catch(() => null),
    ])

    const supabase = await createClient()
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('media_id', seriesId)
      .eq('media_type', 'dizi')

    const reviewCount = reviews?.length ?? 0
    const avgRating = reviewCount > 0
      ? Math.round((reviews!.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : null

    const trailer = series.videos?.results?.find(
      v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    )

    return NextResponse.json({
      id: series.id,
      title: series.name ?? series.title,
      originalTitle: (series as any).original_name ?? (series as any).original_title ?? null,
      overview: series.overview,
      tagline: series.tagline,
      poster: getPosterUrl(series.poster_path, 'w500'),
      backdrop: getBackdropUrl(series.backdrop_path, 'w1280'),
      firstAirDate: series.first_air_date,
      year: series.first_air_date?.slice(0, 4) ?? null,
      numberOfSeasons: series.number_of_seasons ?? null,
      numberOfEpisodes: series.number_of_episodes ?? null,
      certification,
      genres: series.genres.map(g => g.name),
      tmdbRating: series.vote_average,
      tmdbVoteCount: series.vote_count,
      imdbId: series.external_ids?.imdb_id ?? null,
      sinezonRating: avgRating,
      sinezonReviewCount: reviewCount,
      cast: (series.credits?.cast ?? []).slice(0, 12).map(c => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile: c.profile_path ? getPosterUrl(c.profile_path, 'w342') : null,
      })),
      seasons: (series.seasons ?? []).map(s => ({
        id: s.id,
        seasonNumber: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        poster: s.poster_path ? getPosterUrl(s.poster_path, 'w342') : null,
        airDate: s.air_date,
      })),
      trailerKey: trailer?.key ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Dizi bulunamadı' }, { status: 404 })
  }
}
