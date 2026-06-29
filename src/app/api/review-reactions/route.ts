import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reviewId = searchParams.get('review_id')
  if (!reviewId) return NextResponse.json([], { status: 200 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('review_reactions')
    .select('reaction, user_id')
    .eq('review_id', reviewId)

  const counts: Record<string, { count: number; userReacted: boolean }> = {}
  for (const row of data ?? []) {
    if (!counts[row.reaction]) counts[row.reaction] = { count: 0, userReacted: false }
    counts[row.reaction].count++
    if (user && row.user_id === user.id) counts[row.reaction].userReacted = true
  }

  return NextResponse.json(Object.entries(counts).map(([reaction, v]) => ({ reaction, ...v })))
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { review_id, reaction } = await req.json()
  if (!review_id || !reaction) return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })

  const { error } = await supabase.from('review_reactions').upsert({
    review_id, user_id: user.id, reaction,
  }, { onConflict: 'review_id,user_id,reaction' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { review_id, reaction } = await req.json()

  const { error } = await supabase.from('review_reactions')
    .delete()
    .eq('review_id', review_id)
    .eq('user_id', user.id)
    .eq('reaction', reaction)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
