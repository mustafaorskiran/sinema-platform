import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action } = await req.json()

  if (action === 'feature') {
    const featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('lists').update({ is_featured: true, featured_until: featuredUntil }).eq('id', id)
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'list_feature',
      target_type: 'list',
      target_id: id,
      details: { featured_until: featuredUntil },
    })
  } else if (action === 'unfeature') {
    await supabase.from('lists').update({ is_featured: false, featured_until: null }).eq('id', id)
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'list_unfeature',
      target_type: 'list',
      target_id: id,
    })
  } else {
    return NextResponse.json({ error: 'Geçersiz action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
