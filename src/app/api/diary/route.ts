import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { media_id, media_type, watched_at, rating, note, is_rewatch = false, tags = [] } = await req.json()
  if (!media_id || !media_type || !watched_at) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('diary_entries')
    .insert({
      user_id: user.id,
      media_id,
      media_type,
      watched_at,
      rating: rating || null,
      note: note?.trim() || null,
      is_rewatch,
      tags,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
