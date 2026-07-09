import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getUpcomingMoviesYear, getUpcomingTVYear, getAiringTodayTV, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import type { TMDbMovie } from '@/lib/types'

/// Mobil Yayın Takvimi için basitleştirilmiş versiyon — web'in
/// /yayin-takvimi sayfasındaki ~400 sayfalık ağır taramanın aksine,
/// yalnızca ilk 3 sayfa (60 içerik) ile önümüzdeki çıkışları listeler.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-yayin-takvimi:${ip}`, 60 * 1000, 20)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const tip = req.nextUrl.searchParams.get('tip') ?? 'film'
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const oneYear = new Date(now)
  oneYear.setFullYear(oneYear.getFullYear() + 1)
  const oneYearStr = oneYear.toISOString().split('T')[0]

  function mapItem(m: TMDbMovie, type: 'film' | 'dizi') {
    const date = type === 'film' ? (m.release_date ?? '') : ((m as unknown as { first_air_date?: string }).first_air_date ?? '')
    return { id: m.id, title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342'), date, rating: m.vote_average ?? 0, mediaType: type }
  }

  try {
    if (tip === 'bugun-bolum') {
      const results = await getAiringTodayTV(1).catch(() => ({ results: [] as TMDbMovie[] }))
      const items = (results.results ?? []).slice(0, 30).map(m => ({ ...mapItem(m, 'dizi'), date: todayStr }))
      return NextResponse.json({ items })
    }

    const pages = await Promise.all([1, 2, 3].map(p =>
      (tip === 'dizi' ? getUpcomingTVYear(p) : getUpcomingMoviesYear(p)).catch(() => ({ results: [] as TMDbMovie[] }))
    ))
    const all = pages.flatMap(p => p.results ?? [])
    const filtered = all.filter(m => {
      const d = tip === 'dizi' ? ((m as unknown as { first_air_date?: string }).first_air_date ?? '') : (m.release_date ?? '')
      return d >= todayStr && d <= oneYearStr
    })
    const seen = new Set<number>()
    const deduped = filtered.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true })
    const items = deduped.slice(0, 60).map(m => mapItem(m, tip === 'dizi' ? 'dizi' : 'film'))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
