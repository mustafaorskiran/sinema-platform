import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import {
  getMovieDetail, getMovieCertification, getPosterUrl, getBackdropUrl,
} from '@/lib/tmdb'
import { isValidLocale, getTMDbLanguage, DEFAULT_LOCALE } from '@/lib/i18n'

/// Mobil uygulama (ve gelecekte diğer istemciler) için film detay uç noktası.
/// Web'in kendisi bu veriyi doğrudan server component içinde çekiyor
/// (src/app/film/[id]/page.tsx) — burası SADECE dış istemciler için.
/// Web cookie'yle dil belirlerken, mobil istemcinin cookie'si olmadığından
/// ?lang= query param ile app locale kodu (tr/en/de/...) gönderilir.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-film-detail:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const { id } = await params
  const movieId = Number(id)
  if (!Number.isFinite(movieId)) {
    return NextResponse.json({ error: 'Geçersiz id' }, { status: 400 })
  }

  const rawLang = req.nextUrl.searchParams.get('lang') ?? ''
  const tmdbLang = getTMDbLanguage(isValidLocale(rawLang) ? rawLang : DEFAULT_LOCALE)

  try {
    const [movie, certification] = await Promise.all([
      getMovieDetail(movieId, tmdbLang),
      getMovieCertification(movieId).catch(() => null),
    ])

    const supabase = await createClient()
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('media_id', movieId)
      .eq('media_type', 'film')

    const reviewCount = reviews?.length ?? 0
    const avgRating = reviewCount > 0
      ? Math.round((reviews!.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : null

    const trailer = movie.videos?.results?.find(
      v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    )

    return NextResponse.json({
      id: movie.id,
      title: movie.title,
      originalTitle: (movie as any).original_title ?? null,
      overview: movie.overview,
      tagline: movie.tagline,
      poster: getPosterUrl(movie.poster_path, 'w500'),
      backdrop: getBackdropUrl(movie.backdrop_path, 'w1280'),
      releaseDate: movie.release_date,
      year: movie.release_date?.slice(0, 4) ?? null,
      runtime: movie.runtime,
      certification,
      genres: movie.genres.map(g => g.name),
      tmdbRating: movie.vote_average,
      tmdbVoteCount: movie.vote_count,
      imdbId: movie.external_ids?.imdb_id ?? null,
      sinezonRating: avgRating,
      sinezonReviewCount: reviewCount,
      cast: (movie.credits?.cast ?? []).slice(0, 12).map(c => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile: c.profile_path ? getPosterUrl(c.profile_path, 'w342') : null,
      })),
      director: (movie.credits?.crew ?? []).find(c => c.job === 'Director')?.name ?? null,
      trailerKey: trailer?.key ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Film bulunamadı' }, { status: 404 })
  }
}
