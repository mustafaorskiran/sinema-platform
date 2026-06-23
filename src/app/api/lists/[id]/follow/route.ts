import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  if (!await rateLimit(`list-follow:${user.id}`, 60_000, 30)) {
    return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })
  }

  // Can't follow own list
  const { data: list } = await supabase.from('lists').select('user_id').eq('id', id).single()
  if (list?.user_id === user.id) {
    return NextResponse.json({ error: 'Kendi listeni takip edemezsin' }, { status: 400 })
  }

  await supabase.from('list_follows').upsert(
    { list_id: id, user_id: user.id },
    { onConflict: 'list_id,user_id' }
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  await supabase.from('list_follows').delete().eq('list_id', id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
