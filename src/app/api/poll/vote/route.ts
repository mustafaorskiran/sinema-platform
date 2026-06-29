import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST — oy ver / değiştir
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { poll_id, option_idx } = await req.json()
  if (!poll_id || option_idx === undefined) return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })

  const { error } = await supabase.from('poll_votes').upsert(
    { poll_id, user_id: user.id, option_idx },
    { onConflict: 'poll_id,user_id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — oyu kaldır
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { poll_id } = await req.json()
  await supabase.from('poll_votes').delete().eq('poll_id', poll_id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
