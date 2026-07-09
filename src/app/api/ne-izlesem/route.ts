import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { discoverMovies, discoverSeries, getBackdropUrl, getPosterUrl, getMediaTitle, getMediaYear, getActiveTMDbLanguage } from '@/lib/tmdb'

/// Mobil "Ne İzlesem?" (rastgele film/dizi öner) için — web'in
/// /ne-izlesem sayfasındaki deterministik seçici mantığının aynısı.
function pick(seed: number, offset: number, max: number): number {
  return Math.abs((seed * 1664525 + offset * 1013904223) & 0x7fffffff) % max
}

const FILM_GENRES: Record<string, number> = {
  aksiyon: 28, komedi: 35, drama: 18, korku: 27, gerilim: 53, romantik: 10749, animasyon: 16, belgesel: 99,
}
const DIZI_GENRES: Record<string, number> = {
  aksiyon: 10759, komedi: 35, drama: 18, korku: 9648, belgesel: 99, animasyon: 16,
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-ne-izlesem:${ip}`, 60 * 1000, 30)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const { searchParams } = req.nextUrl
  const seed = Number(searchParams.get('seed')) || Math.floor(Math.random() * 1_000_000)
  const tipParam = searchParams.get('tip')
  const tur = searchParams.get('tur')
  const puan = searchParams.get('puan')

  const type = tipParam === 'film' ? 'film' : tipParam === 'dizi' ? 'dizi' : (pick(seed, 0, 2) === 0 ? 'film' : 'dizi')
  const genres = type === 'film' ? FILM_GENRES : DIZI_GENRES
  const genreId = tur && genres[tur] ? genres[tur] : null
  const minRating = puan === '8' ? 8 : puan === '7' ? 7 : undefined

  const maxPage = genreId || minRating ? 5 : 20
  const page = pick(seed, 1, maxPage) + 1

  const discoverParams = {
    sortBy: 'popularity.desc',
    page,
    ...(genreId && { genre: String(genreId) }),
    ...(minRating && { minRating: String(minRating) }),
  }

  try {
    const data = type === 'film' ? await discoverMovies(discoverParams) : await discoverSeries(discoverParams)
    const results = data?.results ?? []
    if (results.length === 0) return NextResponse.json({ item: null })

    const idx = pick(seed, 2, results.length)
    const item = results[idx]
    return NextResponse.json({
      item: {
        id: item.id,
        mediaType: type,
        title: getMediaTitle(item),
        year: getMediaYear(item),
        poster: getPosterUrl(item.poster_path, 'w500'),
        backdrop: getBackdropUrl(item.backdrop_path, 'original'),
        rating: item.vote_average ?? null,
        overview: item.overview ?? null,
      },
      seed,
    })
  } catch {
    return NextResponse.json({ item: null }, { status: 500 })
  }
}
