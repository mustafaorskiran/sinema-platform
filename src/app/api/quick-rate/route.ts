import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { media_id, media_type, rating } = await req.json()
  if (!media_id || !media_type || rating == null) return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  const r = Math.round(Math.min(10, Math.max(1, Number(rating) * 10)) / 10 * 10) / 10

  // Mevcut yorumu güncelle ya da sadece puanlı yeni kayıt oluştur
  const { data: existing } = await supabase
    .from('reviews')
    .select('id, content')
    .eq('user_id', user.id)
    .eq('media_id', media_id)
    .eq('media_type', media_type)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('reviews')
      .update({ rating: r })
      .eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('reviews')
      .insert({ user_id: user.id, media_id, media_type, rating: r, content: '' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, rating: r })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { media_id, media_type } = await req.json()
  await supabase.from('reviews')
    .delete()
    .eq('user_id', user.id)
    .eq('media_id', media_id)
    .eq('media_type', media_type)
    .eq('content', '')

  return NextResponse.json({ ok: true })
}
