import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { party_id, status } = await req.json()
  await supabase.from('watch_party_members')
    .upsert({ party_id, user_id: user.id, status: status ?? 'going' }, { onConflict: 'party_id,user_id' })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { party_id } = await req.json()
  await supabase.from('watch_party_members').delete().eq('party_id', party_id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
