import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })
  const { list_id } = await req.json()
  await supabase.from('list_likes').upsert({ list_id, user_id: user.id }, { onConflict: 'list_id,user_id' })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })
  const { list_id } = await req.json()
  await supabase.from('list_likes').delete().eq('list_id', list_id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
