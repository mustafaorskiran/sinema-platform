import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }

  const body = await req.json()
  const { title, subtitle, emoji, category, slug, list_type, public: pub } = body
  if (!title || !slug) return NextResponse.json({ error: 'title and slug required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lists')
    .insert({
      title,
      subtitle: subtitle || null,
      emoji: emoji || '📋',
      category: category || null,
      slug,
      list_type: list_type || 'manual',
      is_editorial: true,
      public: pub ?? true,
      user_id: null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ list: data })
}

export async function PATCH(req: NextRequest) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }

  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = await createClient()
  const { error } = await supabase.from('lists').update(updates).eq('id', id).eq('is_editorial', true)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
