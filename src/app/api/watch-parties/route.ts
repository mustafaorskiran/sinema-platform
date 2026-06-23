import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const mine = searchParams.get('mine')

  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('watch_parties')
    .select('*, profiles(username, avatar_url), watch_party_members(count), watch_party_items(count)')
    .order('scheduled_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (mine && user) {
    query = query.eq('host_id', user.id)
  }

  const { data } = await query.limit(30)
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { title, description, scheduled_at, items } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Başlık zorunlu' }, { status: 400 })

  const { data: party, error } = await supabase
    .from('watch_parties')
    .insert({ host_id: user.id, title: title.trim(), description: description?.trim() || null, scheduled_at: scheduled_at || null })
    .select('id')
    .single()

  if (error || !party) return NextResponse.json({ error: 'Oluşturulamadı' }, { status: 500 })

  if (items?.length > 0) {
    await supabase.from('watch_party_items').insert(
      items.map((it: { media_id: number; media_type: string }, i: number) => ({
        party_id: party.id, media_id: it.media_id, media_type: it.media_type, position: i,
      }))
    )
  }

  // Host otomatik katılsın
  await supabase.from('watch_party_members').insert({ party_id: party.id, user_id: user.id, status: 'going' })

  return NextResponse.json({ id: party.id })
}
