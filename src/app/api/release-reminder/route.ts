import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { mediaId, mediaType, title, releaseDate } = await req.json()

  const { error } = await supabase.from('release_reminders').upsert({
    user_id: user.id,
    media_id: mediaId,
    media_type: mediaType,
    title,
    release_date: releaseDate ?? null,
  }, { onConflict: 'user_id,media_id,media_type' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { mediaId, mediaType } = await req.json()
  await supabase.from('release_reminders').delete().eq('user_id', user.id).eq('media_id', mediaId).eq('media_type', mediaType)

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ reminders: [] })

  const { data } = await supabase.from('release_reminders').select('media_id, media_type').eq('user_id', user.id)
  return NextResponse.json({ reminders: data ?? [] })
}
