import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existing } = await supabase
    .from('quote_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('quote_id', id)
    .single()

  if (existing) {
    await supabase.from('quote_likes').delete().eq('id', existing.id)
    const { data: q } = await supabase.from('quotes').select('likes_count').eq('id', id).single()
    return NextResponse.json({ liked: false, likes_count: q?.likes_count ?? 0 })
  } else {
    await supabase.from('quote_likes').insert({ user_id: user.id, quote_id: id })
    const { data: q } = await supabase.from('quotes').select('likes_count').eq('id', id).single()
    return NextResponse.json({ liked: true, likes_count: q?.likes_count ?? 0 })
  }
}
