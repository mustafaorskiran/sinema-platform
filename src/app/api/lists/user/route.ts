import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 200 })

  const { searchParams } = new URL(req.url)
  const media_id = Number(searchParams.get('media_id'))
  const media_type = searchParams.get('media_type')

  const { data: ownLists } = await supabase
    .from('lists')
    .select('id, title')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  let lists = ownLists ?? []

  // Adminler editöryal listelere de (sahipsiz, is_editorial=true) içerik
  // ekleyip çıkarabilir — aynı dropdown, ayrı bir admin arayüzü gerekmiyor.
  if (await isAdmin(supabase, user.id)) {
    const { data: editorialLists } = await supabase
      .from('lists')
      .select('id, title')
      .is('user_id', null)
      .eq('is_editorial', true)
      .order('created_at', { ascending: false })
    if (editorialLists?.length) {
      lists = [...lists, ...editorialLists.map(l => ({ id: l.id, title: `🎬 ${l.title}` }))]
    }
  }

  if (!lists.length) return NextResponse.json([])

  const listIds = lists.map(l => l.id)
  const { data: existingItems } = await supabase
    .from('list_items')
    .select('id, list_id')
    .in('list_id', listIds)
    .eq('media_id', media_id)
    .eq('media_type', media_type!)

  const existingMap = new Map(existingItems?.map(i => [i.list_id, i.id]) ?? [])

  const result = lists.map(l => ({
    id: l.id,
    title: l.title,
    item_exists: existingMap.has(l.id),
    item_id: existingMap.get(l.id) ?? null,
  }))

  return NextResponse.json(result)
}
