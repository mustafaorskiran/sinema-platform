import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getCountryBySlug } from '@/lib/countries'
import { discoverMovieRaw, discoverTVRaw, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'

/// Mobil için /ulke/[slug] sayfasının aynısı.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-ulke-kesif:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const slug = req.nextUrl.searchParams.get('ulke') ?? ''
  const country = getCountryBySlug(slug)
  if (!country) return NextResponse.json({ error: 'Ülke bulunamadı' }, { status: 404 })

  const tab = req.nextUrl.searchParams.get('tab') === 'diziler' ? 'diziler' : 'filmler'
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('sayfa')) || 1)
  const mediaType = tab === 'filmler' ? 'film' : 'dizi'

  const baseParams = {
    with_origin_country: country.code,
    sort_by: 'vote_average.desc',
    'vote_count.gte': country.code === 'TR' ? '50' : '200',
  }

  try {
    const data = tab === 'filmler'
      ? await discoverMovieRaw(baseParams, page).catch(() => ({ results: [], total_pages: 1 }))
      : await discoverTVRaw(baseParams, page).catch(() => ({ results: [], total_pages: 1 }))

    const items = (data.results ?? []).map((m, idx) => ({
      id: m.id,
      mediaType,
      title: getMediaTitle(m),
      poster: getPosterUrl(m.poster_path, 'w342'),
      year: getMediaYear(m),
      rating: m.vote_average ?? null,
      rank: (page - 1) * 20 + idx + 1,
    }))

    return NextResponse.json({
      name: country.name,
      flag: country.flag,
      nativeName: country.nativeName ?? null,
      items,
      totalPages: Math.min(data.total_pages ?? 1, 10),
    })
  } catch {
    return NextResponse.json({ items: [], totalPages: 1 }, { status: 500 })
  }
}
