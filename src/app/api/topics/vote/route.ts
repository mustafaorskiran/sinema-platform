import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { topic_id, media_id, media_type } = await req.json()
  if (!topic_id || !media_id || !media_type) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  }

  // Zaten oy verdiyse kaldır (toggle)
  const { data: existing } = await supabase
    .from('topic_votes')
    .select('id')
    .eq('topic_id', topic_id)
    .eq('user_id', user.id)
    .eq('media_id', media_id)
    .eq('media_type', media_type)
    .single()

  if (existing) {
    await supabase.from('topic_votes').delete().eq('id', existing.id)
    return NextResponse.json({ voted: false })
  }

  await supabase.from('topic_votes').insert({ topic_id, user_id: user.id, media_id, media_type })
  return NextResponse.json({ voted: true })
}
