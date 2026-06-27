import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goal } = await req.json()
  const goalNum = Number(goal)
  if (!goalNum || goalNum < 1 || goalNum > 9999) {
    return NextResponse.json({ error: 'Geçersiz hedef' }, { status: 400 })
  }

  const year = new Date().getFullYear()
  await supabase.from('profiles').update({ watch_goal: goalNum, watch_goal_year: year }).eq('id', user.id)
  return NextResponse.json({ ok: true })
}
