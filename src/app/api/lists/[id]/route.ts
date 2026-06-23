import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, public: isPublic, cover_url } = await req.json()
  const update: Record<string, unknown> = {
    title: title?.trim(),
    description: description?.trim() || null,
    public: isPublic,
  }
  if (cover_url !== undefined) update.cover_url = cover_url?.trim() || null

  const { error } = await supabase
    .from('lists')
    .update(update)
    .eq('id', id).eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('lists').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
