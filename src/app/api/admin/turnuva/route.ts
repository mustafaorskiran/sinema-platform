import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, film_ids } = await req.json()
  if (!title || !Array.isArray(film_ids) || film_ids.length !== 8) {
    return NextResponse.json({ error: 'Geçersiz veri: başlık ve tam olarak 8 film ID gerekli' }, { status: 400 })
  }

  await supabase.from('versus_tournaments').update({ is_active: false }).eq('is_active', true)

  const { error } = await supabase.from('versus_tournaments').insert({
    title,
    film_ids,
    is_active: true,
    ends_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
