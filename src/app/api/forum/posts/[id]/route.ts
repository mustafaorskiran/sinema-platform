import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { id } = await params

  // Check ownership or admin
  const [{ data: post }, { data: profile }] = await Promise.all([
    supabase.from('forum_posts').select('user_id').eq('id', id).single(),
    supabase.from('profiles').select('is_admin').eq('id', user.id).single(),
  ])

  if (!post) return NextResponse.json({ error: 'Gönderi bulunamadı' }, { status: 404 })
  if (post.user_id !== user.id && !profile?.is_admin) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  const { error } = await supabase.from('forum_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
