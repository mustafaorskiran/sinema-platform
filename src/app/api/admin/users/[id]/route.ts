import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? { supabase, adminId: user.id } : null
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await checkAdmin()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const { supabase, adminId } = ctx
  const { action, ban_reason } = await req.json()

  if (action === 'toggle-admin') {
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', id).single()
    await supabase.from('profiles').update({ is_admin: !data?.is_admin }).eq('id', id)
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: data?.is_admin ? 'user_remove_admin' : 'user_make_admin',
      target_type: 'user',
      target_id: id,
    })
  } else if (action === 'toggle-ban') {
    const { data } = await supabase.from('profiles').select('banned').eq('id', id).single()
    const nowBanned = !data?.banned
    await supabase.from('profiles').update({
      banned: nowBanned,
      ban_reason: nowBanned ? (ban_reason?.trim() || null) : null,
    }).eq('id', id)
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: nowBanned ? 'user_ban' : 'user_unban',
      target_type: 'user',
      target_id: id,
      details: nowBanned && ban_reason ? { reason: ban_reason.trim() } : null,
    })
  }

  return NextResponse.json({ ok: true })
}
