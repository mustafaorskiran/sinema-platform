import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(null)

  const { searchParams } = new URL(request.url)
  const media_id = searchParams.get('media_id')
  const media_type = searchParams.get('media_type')
  if (!media_id || !media_type) return NextResponse.json(null)

  const { data } = await supabase
    .from('private_notes')
    .select('note')
    .eq('user_id', user.id)
    .eq('media_id', Number(media_id))
    .eq('media_type', media_type)
    .maybeSingle()

  return NextResponse.json(data?.note ?? '')
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })

  const { media_id, media_type, note } = await request.json()
  if (!media_id || !media_type) return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 })

  if (!note || note.trim() === '') {
    await supabase.from('private_notes').delete()
      .eq('user_id', user.id).eq('media_id', media_id).eq('media_type', media_type)
    return NextResponse.json({ success: true })
  }

  const { error } = await supabase
    .from('private_notes')
    .upsert({ user_id: user.id, media_id, media_type, note: note.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id,media_id,media_type' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
