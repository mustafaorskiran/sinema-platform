import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTopRatedMovies, discoverMovies } from '@/lib/tmdb'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: list } = await supabase
    .from('lists')
    .select('*')
    .eq('slug', slug)
    .eq('is_editorial', true)
    .single()

  if (!list) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (list.list_type === 'dynamic_top250') {
    // Supabase'den ortalama puanı en yüksek 250 film
    const { data: rows } = await supabase
      .from('reviews')
      .select('media_id, media_type, rating')
      .eq('media_type', 'film')
      .gt('rating', 0)

    const sums: Record<number, { sum: number; count: number }> = {}
    for (const r of rows ?? []) {
      if (!sums[r.media_id]) sums[r.media_id] = { sum: 0, count: 0 }
      sums[r.media_id].sum += r.rating
      sums[r.media_id].count++
    }
    const ranked = Object.entries(sums)
      .filter(([, v]) => v.count >= 3)
      .map(([id, v]) => ({ media_id: Number(id), avg: v.sum / v.count, count: v.count }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count)
      .slice(0, 250)

    const ids = ranked.map(r => r.media_id)
    const { data: movies } = ids.length > 0
      ? await supabase.from('movies').select('tmdb_id,title,poster_path,vote_average').in('tmdb_id', ids)
      : { data: [] }

    const movieMap = new Map((movies ?? []).map(m => [m.tmdb_id, m]))
    const items = ranked
      .filter(r => movieMap.has(r.media_id))
      .map((r, i) => ({
        position: i + 1,
        media_id: r.media_id,
        media_type: 'film',
        title: movieMap.get(r.media_id)!.title,
        poster_path: movieMap.get(r.media_id)!.poster_path,
        site_avg: parseFloat(r.avg.toFixed(1)),
        site_count: r.count,
        vote_average: movieMap.get(r.media_id)!.vote_average,
      }))

    return NextResponse.json({ list, items })
  }

  if (list.list_type === 'dynamic_imdb') {
    // TMDb /movie/top_rated — zaten vote_count minimumunu kendisi uygular
    const allItems: {
      position: number; media_id: number; media_type: string;
      title: string; poster_path: string | null; vote_average: number; vote_count: number
    }[] = []

    for (let page = 1; page <= 13 && allItems.length < 250; page++) {
      const data = await getTopRatedMovies(page).catch(() => null)
      if (!data || !data.results?.length) break
      for (const m of data.results) {
        allItems.push({
          position: allItems.length + 1,
          media_id: m.id,
          media_type: 'film',
          title: (m as any).title ?? '',
          poster_path: m.poster_path,
          vote_average: m.vote_average,
          vote_count: m.vote_count,
        })
        if (allItems.length >= 250) break
      }
    }

    return NextResponse.json({ list, items: allItems })
  }

  if (list.list_type === 'dynamic_top250_dizi') {
    // Supabase'den ortalama puanı en yüksek 250 dizi
    const { data: rows } = await supabase
      .from('reviews').select('media_id, rating')
      .eq('media_type', 'dizi').gt('rating', 0)

    const sums: Record<number, { sum: number; count: number }> = {}
    for (const r of rows ?? []) {
      if (!sums[r.media_id]) sums[r.media_id] = { sum: 0, count: 0 }
      sums[r.media_id].sum += r.rating
      sums[r.media_id].count++
    }
    const ranked = Object.entries(sums)
      .filter(([, v]) => v.count >= 3)
      .map(([id, v]) => ({ media_id: Number(id), avg: v.sum / v.count, count: v.count }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count).slice(0, 250)

    const ids = ranked.map(r => r.media_id)
    const { data: series } = ids.length > 0
      ? await supabase.from('series').select('tmdb_id,title,poster_path,vote_average').in('tmdb_id', ids)
      : { data: [] }

    const seriesMap = new Map((series ?? []).map(s => [s.tmdb_id, s]))
    const items = ranked.filter(r => seriesMap.has(r.media_id)).map((r, i) => ({
      position: i + 1, media_id: r.media_id, media_type: 'dizi',
      title: seriesMap.get(r.media_id)!.title,
      poster_path: seriesMap.get(r.media_id)!.poster_path,
      site_avg: parseFloat(r.avg.toFixed(1)), site_count: r.count,
      vote_average: seriesMap.get(r.media_id)!.vote_average,
    }))
    return NextResponse.json({ list, items })
  }

  if (list.list_type?.startsWith('dynamic_genre_top50_')) {
    const genreId = list.list_type.replace('dynamic_genre_top50_', '')
    const allItems: { position: number; media_id: number; media_type: string; title: string; poster_path: string | null; vote_average: number }[] = []
    for (let page = 1; page <= 3 && allItems.length < 50; page++) {
      const data = await discoverMovies({ genre: genreId, sortBy: 'vote_average.desc', minRating: '7', page }).catch(() => null)
      if (!data?.results?.length) break
      for (const m of data.results) {
        if (m.vote_count < 1000) continue
        allItems.push({ position: allItems.length + 1, media_id: m.id, media_type: 'film', title: (m as any).title ?? '', poster_path: m.poster_path, vote_average: m.vote_average })
        if (allItems.length >= 50) break
      }
    }
    return NextResponse.json({ list, items: allItems })
  }

  return NextResponse.json({ error: 'not found' }, { status: 404 })
}
