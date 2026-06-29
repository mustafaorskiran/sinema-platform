import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { badges } = await req.json() // string[] max 3
  if (!Array.isArray(badges) || badges.length > 3) {
    return NextResponse.json({ error: 'En fazla 3 rozet seçilebilir' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ pinned_badges: badges })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
