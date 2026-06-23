import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(null)

  const year = new Date().getFullYear()

  const [{ data: challenge }, { count: filmCount }, { count: seriesCount }] = await Promise.all([
    supabase.from('yearly_challenges').select('*').eq('user_id', user.id).eq('year', year).maybeSingle(),
    supabase.from('watchlist').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('status', 'izledim').eq('media_type', 'film')
      .gte('created_at', `${year}-01-01`),
    supabase.from('watchlist').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('status', 'izledim').eq('media_type', 'dizi')
      .gte('created_at', `${year}-01-01`),
  ])

  return NextResponse.json({
    challenge,
    watched: { films: filmCount ?? 0, series: seriesCount ?? 0 },
    year,
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { film_goal, series_goal } = await req.json()
  const year = new Date().getFullYear()

  await supabase.from('yearly_challenges').upsert(
    { user_id: user.id, year, film_goal, series_goal, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,year' }
  )

  return NextResponse.json({ ok: true })
}
