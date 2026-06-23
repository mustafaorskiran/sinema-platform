import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, public: isPublic } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Başlık gerekli' }, { status: 400 })

  const { data, error } = await supabase
    .from('lists')
    .insert({ user_id: user.id, title: title.trim(), description: description?.trim() || null, public: isPublic ?? true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
