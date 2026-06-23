import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ watched: [] })

  const seriesId = Number(req.nextUrl.searchParams.get('series_id'))
  if (!seriesId) return NextResponse.json({ watched: [] })

  const { data } = await supabase
    .from('episode_watches')
    .select('season_number, episode_number, rating, review')
    .eq('user_id', user.id)
    .eq('series_id', seriesId)

  return NextResponse.json({ watched: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { series_id, season_number, episode_number, rating, review } = await req.json()
  if (!series_id || season_number == null || episode_number == null)
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })

  const { error } = await supabase.from('episode_watches').upsert({
    user_id: user.id,
    series_id,
    season_number,
    episode_number,
    rating: rating ?? null,
    review: review ?? null,
  }, { onConflict: 'user_id,series_id,season_number,episode_number' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { series_id, season_number, episode_number } = await req.json()

  const { error } = await supabase
    .from('episode_watches')
    .delete()
    .eq('user_id', user.id)
    .eq('series_id', series_id)
    .eq('season_number', season_number)
    .eq('episode_number', episode_number)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
