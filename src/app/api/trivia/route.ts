import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const media_id   = Number(searchParams.get('media_id'))
  const media_type = searchParams.get('media_type')
  if (!media_id || !media_type) return NextResponse.json({ items: [] })

  const supabase = await createClient()
  const { data } = await supabase
    .from('trivia')
    .select('id, content, type, created_at, profiles(username)')
    .eq('media_id', media_id)
    .eq('media_type', media_type)
    .eq('approved', true)
    .order('created_at', { ascending: true })

  return NextResponse.json({ items: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { media_id, media_type, type, content } = body
  if (!media_id || !media_type || !content?.trim())
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const { error } = await supabase.from('trivia').insert({
    media_id: Number(media_id),
    media_type,
    type: type ?? 'trivia',
    content: content.trim(),
    user_id: user.id,
    approved: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
