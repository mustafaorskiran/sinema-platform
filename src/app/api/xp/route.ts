import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const XP_VALUES: Record<string, number> = {
  review: 10,
  rating: 3,
  diary: 5,
  list_create: 15,
  forum_thread: 20,
  follow: 2,
  daily_task: 25,
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json()
  const xpGain = XP_VALUES[action] ?? 0
  if (xpGain === 0) return NextResponse.json({ ok: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level, current_streak, longest_streak, last_activity_date')
    .eq('id', user.id)
    .single()

  const currentXp = ((profile as any)?.xp ?? 0) + xpGain
  const newLevel = Math.floor(Math.sqrt(currentXp / 50)) + 1

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const lastDate = (profile as any)?.last_activity_date

  let newStreak = (profile as any)?.current_streak ?? 0
  if (lastDate === today) { /* same day */ }
  else if (lastDate === yesterday) newStreak++
  else newStreak = 1

  const newLongest = Math.max(newStreak, (profile as any)?.longest_streak ?? 0)

  await supabase.from('profiles').update({
    xp: currentXp,
    level: newLevel,
    current_streak: newStreak,
    longest_streak: newLongest,
    last_activity_date: today,
  }).eq('id', user.id)

  return NextResponse.json({ ok: true, xp: currentXp, level: newLevel, streak: newStreak })
}
