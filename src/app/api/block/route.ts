import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { blockedId } = await req.json()
  if (!blockedId || blockedId === user.id) return NextResponse.json({ error: 'Geçersiz' }, { status: 400 })

  await supabase.from('blocked_users').upsert({ blocker_id: user.id, blocked_id: blockedId }, { onConflict: 'blocker_id,blocked_id' })
  // Takipleşme varsa kaldır
  await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', blockedId)
  await supabase.from('follows').delete().eq('follower_id', blockedId).eq('following_id', user.id)

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { blockedId } = await req.json()
  await supabase.from('blocked_users').delete().eq('blocker_id', user.id).eq('blocked_id', blockedId)

  return NextResponse.json({ ok: true })
}
