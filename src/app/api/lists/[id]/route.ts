import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { NextRequest, NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string }> }

async function canManage(supabase: Awaited<ReturnType<typeof createClient>>, listId: string, userId: string) {
  const { data: list } = await supabase.from('lists').select('user_id, is_editorial').eq('id', listId).single()
  if (!list) return false
  if (list.user_id === userId) return true
  if (list.is_editorial && list.user_id === null) return isAdmin(supabase, userId)
  return false
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await canManage(supabase, id, user.id)) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })

  const { title, description, public: isPublic, cover_url } = await req.json()
  const update: Record<string, unknown> = {
    title: title?.trim(),
    description: description?.trim() || null,
    public: isPublic,
  }
  if (cover_url !== undefined) update.cover_url = cover_url?.trim() || null

  const { error } = await supabase
    .from('lists')
    .update(update)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await canManage(supabase, id, user.id)) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })

  await supabase.from('lists').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
