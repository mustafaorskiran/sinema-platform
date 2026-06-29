import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ streak: 0, best_streak: 0, played_today: false })

  const { data } = await supabase
    .from('daily_quiz_streaks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return NextResponse.json({ streak: 0, best_streak: 0, played_today: false, total_played: 0 })

  const today = new Date().toISOString().slice(0, 10)
  const played_today = data.last_played === today

  return NextResponse.json({
    streak: data.streak,
    best_streak: data.best_streak,
    played_today,
    total_played: data.total_played ?? 0,
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { score } = await req.json() // score: number (0-10)
  const passed = score >= 5 // Geçer not: 10 sorudan 5 doğru

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  const { data: existing } = await supabase
    .from('daily_quiz_streaks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing?.last_played === today) {
    return NextResponse.json({ message: 'Bugün zaten oynadın', streak: existing.streak, already_played: true })
  }

  let newStreak = 1
  if (existing) {
    if (existing.last_played === yesterday && passed) {
      newStreak = existing.streak + 1
    } else if (!passed) {
      newStreak = 0
    }
  }

  const newBest = Math.max(newStreak, existing?.best_streak ?? 0)

  await supabase.from('daily_quiz_streaks').upsert({
    user_id: user.id,
    streak: passed ? newStreak : 0,
    best_streak: newBest,
    last_played: today,
    total_played: (existing?.total_played ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return NextResponse.json({ streak: passed ? newStreak : 0, best_streak: newBest, passed })
}
