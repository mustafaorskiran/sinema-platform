import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { score, correct, total } = await req.json()
  if (typeof score !== 'number' || typeof correct !== 'number' || typeof total !== 'number') {
    return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 })
  }

  const { error } = await supabase.from('quiz_scores').insert({ user_id: user.id, score, correct, total })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('quiz_scores')
    .select('score, correct, total, created_at, profiles(username, avatar_url)')
    .order('score', { ascending: false })
    .limit(10)

  return NextResponse.json(data ?? [])
}
