import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getAdminCtx() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!data?.is_admin) return null
  return { supabase, adminId: user.id }
}

async function logAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>
) {
  await supabase.from('admin_logs').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details: details ?? null,
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAdminCtx()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const { supabase, adminId } = ctx

  const { data: review } = await supabase.from('reviews').select('user_id, content').eq('id', id).single()
  await supabase.from('reviews').delete().eq('id', id)
  await logAction(supabase, adminId, 'review_delete', 'review', id, {
    owner_id: review?.user_id,
    excerpt: review?.content?.slice(0, 100),
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAdminCtx()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const { supabase, adminId } = ctx
  const { action, note } = await req.json()

  if (action === 'hide') {
    await supabase.from('reviews').update({ is_hidden: true }).eq('id', id)
    await logAction(supabase, adminId, 'review_hide', 'review', id)
  } else if (action === 'unhide') {
    await supabase.from('reviews').update({ is_hidden: false }).eq('id', id)
    await logAction(supabase, adminId, 'review_unhide', 'review', id)
  } else if (action === 'note') {
    if (!note?.trim()) return NextResponse.json({ error: 'Not boş olamaz' }, { status: 400 })
    await supabase.from('reviews').update({ moderation_note: note.trim() }).eq('id', id)
    await logAction(supabase, adminId, 'review_note', 'review', id, { note: note.trim() })
  } else {
    return NextResponse.json({ error: 'Geçersiz action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
