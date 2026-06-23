import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { list_id } = await req.json()

  const { data: original } = await supabase
    .from('lists')
    .select('title, description')
    .eq('id', list_id)
    .single()

  if (!original) return NextResponse.json({ error: 'Liste bulunamadı' }, { status: 404 })

  const { data: newList, error } = await supabase
    .from('lists')
    .insert({ user_id: user.id, title: `${original.title} (kopya)`, description: original.description, public: false })
    .select('id')
    .single()

  if (error || !newList) return NextResponse.json({ error: 'Liste oluşturulamadı' }, { status: 500 })

  const { data: items } = await supabase.from('list_items').select('media_id, media_type, note, position').eq('list_id', list_id)

  if (items && items.length > 0) {
    await supabase.from('list_items').insert(items.map(i => ({ ...i, list_id: newList.id })))
  }

  return NextResponse.json({ list_id: newList.id })
}
