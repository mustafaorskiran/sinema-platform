import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { NextRequest, NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id: list_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify list belongs to this user (veya editöryal liste + admin)
  const { data: list } = await supabase
    .from('lists')
    .select('user_id, is_editorial')
    .eq('id', list_id)
    .single()

  if (!list) return NextResponse.json({ error: 'Liste bulunamadı' }, { status: 404 })
  const owns = list.user_id === user.id
  const editorialAdmin = list.is_editorial && list.user_id === null && await isAdmin(supabase, user.id)
  if (!owns && !editorialAdmin) return NextResponse.json({ error: 'Bu listeye ekleme yapma yetkiniz yok' }, { status: 403 })

  const { media_id, media_type, note } = await req.json()

  const { count } = await supabase
    .from('list_items')
    .select('*', { count: 'exact', head: true })
    .eq('list_id', list_id)

  const { data, error } = await supabase
    .from('list_items')
    .upsert(
      { list_id, media_id, media_type, note: note?.trim() || null, position: (count ?? 0) + 1 },
      { onConflict: 'list_id,media_id,media_type' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
