import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { review_id } = await req.json()
  if (!review_id) return NextResponse.json({ error: 'review_id gerekli' }, { status: 400 })

  const { data: review } = await supabase
    .from('reviews')
    .select('id')
    .eq('id', review_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!review) return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })

  await supabase.from('reviews').update({ is_pinned: false }).eq('user_id', user.id)
  await supabase.from('reviews').update({ is_pinned: true }).eq('id', review_id)

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  await supabase.from('reviews').update({ is_pinned: false }).eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
