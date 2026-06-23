import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }

  const { id, action } = await req.json()
  if (!id || !['approve', 'reject'].includes(action))
    return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const supabase = await createClient()
  if (action === 'approve') {
    await supabase.from('trivia').update({ approved: true }).eq('id', id)
  } else {
    await supabase.from('trivia').delete().eq('id', id)
  }
  return NextResponse.json({ ok: true })
}
