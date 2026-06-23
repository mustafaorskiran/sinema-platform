import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/conversations — all conversations for current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const { data } = await supabase
    .from('conversations')
    .select(`
      id, updated_at,
      p1:profiles!participant_1(id, username, avatar_url),
      p2:profiles!participant_2(id, username, avatar_url)
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('updated_at', { ascending: false })
    .limit(30)

  return NextResponse.json(data ?? [])
}

// POST /api/conversations — get or create with another user
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { other_user_id } = await req.json()
  if (!other_user_id || other_user_id === user.id) return NextResponse.json({ error: 'Geçersiz' }, { status: 400 })

  // Canonical order: smaller UUID first
  const [p1, p2] = [user.id, other_user_id].sort()

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant_1', p1)
    .eq('participant_2', p2)
    .maybeSingle()

  if (existing) return NextResponse.json({ id: existing.id })

  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({ participant_1: p1, participant_2: p2 })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: newConv.id })
}
