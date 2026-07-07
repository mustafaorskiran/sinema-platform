import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string; itemId: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id: list_id, itemId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify list belongs to this user
  const { data: list } = await supabase
    .from('lists')
    .select('user_id')
    .eq('id', list_id)
    .single()

  if (!list) return NextResponse.json({ error: 'Liste bulunamadı' }, { status: 404 })
  if (list.user_id !== user.id) return NextResponse.json({ error: 'Bu listeden silme yetkiniz yok' }, { status: 403 })

  await supabase.from('list_items').delete().eq('id', itemId).eq('list_id', list_id)
  return NextResponse.json({ ok: true })
}
