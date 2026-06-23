import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ goal: null })

  const year = Number(req.nextUrl.searchParams.get('year')) || new Date().getFullYear()

  const { data: goal } = await supabase
    .from('watch_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', year)
    .maybeSingle()

  // Gerçek izleme sayıları
  const [{ count: filmCount }, { count: seriesCount }] = await Promise.all([
    supabase.from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'izledim')
      .eq('media_type', 'film'),
    supabase.from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'izledim')
      .eq('media_type', 'dizi'),
  ])

  return NextResponse.json({ goal, watched: { films: filmCount ?? 0, series: seriesCount ?? 0 } })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { year, target_films, target_series } = await req.json()

  const { data, error } = await supabase
    .from('watch_goals')
    .upsert({
      user_id: user.id,
      year: year ?? new Date().getFullYear(),
      target_films: target_films ?? 0,
      target_series: target_series ?? 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,year' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
