import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { id } = await params

  // Check ownership or admin
  const [{ data: thread }, { data: profile }] = await Promise.all([
    supabase.from('forum_threads').select('user_id').eq('id', id).single(),
    supabase.from('profiles').select('is_admin').eq('id', user.id).single(),
  ])

  if (!thread) return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 })
  if (thread.user_id !== user.id && !profile?.is_admin) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  const { error } = await supabase.from('forum_threads').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { id } = await params

  // Check ownership or admin
  const [{ data: thread }, { data: profile }] = await Promise.all([
    supabase.from('forum_threads').select('user_id').eq('id', id).single(),
    supabase.from('profiles').select('is_admin').eq('id', user.id).single(),
  ])

  if (!thread) return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 })
  if (thread.user_id !== user.id && !profile?.is_admin) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  const body = await req.json()
  // Only allow updating safe fields — prevent arbitrary column updates
  // is_pinned/is_locked yalnızca admin tarafından değiştirilebilir
  const allowed = profile?.is_admin
    ? ['title', 'content', 'is_pinned', 'is_locked']
    : ['title', 'content']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 })
  }

  const { error } = await supabase.from('forum_threads').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
