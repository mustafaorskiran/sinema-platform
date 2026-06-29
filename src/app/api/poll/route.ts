import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/poll?id=... — tek anket
// GET /api/poll       — son 20 anket
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const id = req.nextUrl.searchParams.get('id')

  if (id) {
    const { data } = await supabase
      .from('polls')
      .select('*, profiles(username, avatar_url), poll_votes(option_idx, user_id)')
      .eq('id', id)
      .single()
    return NextResponse.json(data ?? null)
  }

  const { data } = await supabase
    .from('polls')
    .select('*, profiles(username, avatar_url), poll_votes(option_idx)')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json(data ?? [])
}

// POST /api/poll — anket oluştur
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { question, options, media_id, media_type, ends_at } = await req.json()
  if (!question?.trim() || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: 'En az 2 seçenek gerekli' }, { status: 400 })
  }
  if (options.length > 6) return NextResponse.json({ error: 'En fazla 6 seçenek' }, { status: 400 })

  const { data, error } = await supabase.from('polls').insert({
    user_id: user.id,
    question: question.trim(),
    options: options.map((o: string) => o.trim()).filter(Boolean),
    media_id: media_id ?? null,
    media_type: media_type ?? null,
    ends_at: ends_at ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
