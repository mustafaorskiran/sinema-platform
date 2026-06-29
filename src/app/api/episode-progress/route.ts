import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const seriesId = req.nextUrl.searchParams.get('series_id')
  if (!seriesId) return NextResponse.json({ error: 'series_id gerekli' }, { status: 400 })

  const { data } = await supabase
    .from('episode_progress')
    .select('season, episode, watched_at')
    .eq('user_id', user.id)
    .eq('series_id', Number(seriesId))
    .order('season').order('episode')

  return NextResponse.json({ watched: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { series_id, season, episode } = await req.json()
  if (!series_id || !season || !episode) return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })

  const { error } = await supabase.from('episode_progress').upsert(
    { user_id: user.id, series_id, season, episode },
    { onConflict: 'user_id,series_id,season,episode' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { series_id, season, episode } = await req.json()

  const { error } = await supabase.from('episode_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('series_id', series_id)
    .eq('season', season)
    .eq('episode', episode)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
