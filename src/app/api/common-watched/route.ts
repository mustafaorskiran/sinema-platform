import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMovieMini, getSeriesMini } from '@/lib/tmdb'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const targetUserId = req.nextUrl.searchParams.get('user_id')
  if (!targetUserId) return NextResponse.json([])

  const [{ data: myList }, { data: theirList }] = await Promise.all([
    supabase.from('watchlist').select('media_id, media_type').eq('user_id', user.id).eq('status', 'izledim'),
    supabase.from('watchlist').select('media_id, media_type').eq('user_id', targetUserId).eq('status', 'izledim'),
  ])

  if (!myList || !theirList) return NextResponse.json([])

  const theirSet = new Set(theirList.map((r: { media_id: number; media_type: string }) => `${r.media_type}-${r.media_id}`))
  const common = myList.filter((r: { media_id: number; media_type: string }) => theirSet.has(`${r.media_type}-${r.media_id}`))

  if (common.length === 0) return NextResponse.json([])

  // Fetch titles + posters from TMDb for first 60
  const slice = common.slice(0, 60)
  const enriched = await Promise.all(
    slice.map(async (item: { media_id: number; media_type: string }) => {
      try {
        const data = item.media_type === 'film'
          ? await getMovieMini(item.media_id)
          : await getSeriesMini(item.media_id)
        return {
          media_id: item.media_id,
          media_type: item.media_type,
          title: (data as { title?: string; name?: string }).title ?? (data as { title?: string; name?: string }).name ?? '',
          poster_path: data.poster_path ?? null,
        }
      } catch {
        return { media_id: item.media_id, media_type: item.media_type, title: '', poster_path: null }
      }
    })
  )

  return NextResponse.json(enriched)
}
