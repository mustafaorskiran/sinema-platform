import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const media_id = searchParams.get('media_id')
  const media_type = searchParams.get('media_type')
  if (!media_id || !media_type) return NextResponse.json([], { status: 400 })

  const supabase = await createClient()
  const { data } = await supabase
    .from('quotes')
    .select('id, content, character_name, profiles(username)')
    .eq('media_id', Number(media_id))
    .eq('media_type', media_type)
    .eq('approved', true)
    .order('created_at', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { media_id, media_type, content, character_name } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'İçerik boş olamaz' }, { status: 400 })

  const { data, error } = await supabase
    .from('quotes')
    .insert({ media_id, media_type, content: content.trim(), character_name: character_name?.trim() || null, user_id: user.id })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, message: 'Alıntı incelemeye alındı.' })
}
