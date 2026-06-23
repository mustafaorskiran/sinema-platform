import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mediaId = Number(searchParams.get('media_id'))
  const mediaType = searchParams.get('media_type') ?? 'film'

  if (!mediaId) return NextResponse.json({ results: [] })

  const supabase = await createClient()

  // Aynı içeriği izleyen kullanıcılar
  const { data: watchers } = await supabase
    .from('watchlist')
    .select('user_id')
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .eq('status', 'izledim')
    .limit(200)

  const watcherIds = (watchers ?? []).map(w => w.user_id)

  if (watcherIds.length === 0) {
    return NextResponse.json({ results: [], count: 0 })
  }

  // Bu kullanıcıların başka neler izlediği
  const { data: watchedByOthers } = await supabase
    .from('watchlist')
    .select('media_id')
    .in('user_id', watcherIds)
    .eq('media_type', mediaType)
    .eq('status', 'izledim')
    .neq('media_id', mediaId)

  if (!watchedByOthers || watchedByOthers.length === 0) {
    return NextResponse.json({ results: [], count: 0 })
  }

  // Frekans sayımı
  const countMap: Record<number, number> = {}
  for (const row of watchedByOthers) {
    countMap[row.media_id] = (countMap[row.media_id] ?? 0) + 1
  }

  // En çok izlenen 12 içerik
  const topIds = Object.entries(countMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([id]) => Number(id))

  // Katalogdan detay çek
  const table = mediaType === 'dizi' ? 'series' : 'movies'
  const idCol = 'tmdb_id'
  const titleCol = mediaType === 'dizi' ? 'name' : 'title'

  const { data: catalogItems } = await supabase
    .from(table)
    .select(`${idCol}, ${titleCol}, poster_path, vote_average`)
    .in(idCol, topIds)

  if (!catalogItems || catalogItems.length === 0) {
    return NextResponse.json({ results: [], count: watcherIds.length })
  }

  const results = catalogItems.map((item: any) => ({
    id: item.tmdb_id,
    title: item[titleCol] ?? '',
    poster: item.poster_path ? getPosterUrl(item.poster_path, 'w342') : null,
    rating: item.vote_average ?? 0,
    type: mediaType,
    overlap: countMap[item.tmdb_id] ?? 0,
  })).sort((a, b) => b.overlap - a.overlap)

  return NextResponse.json({ results, count: watcherIds.length })
}
