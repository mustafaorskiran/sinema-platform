import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })

  const { data } = await supabase
    .from('profile_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('position')

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })

  const { media_id, media_type, position } = await request.json()
  if (!media_id || !media_type || !position || position < 1 || position > 4) {
    return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profile_favorites')
    .upsert({ user_id: user.id, media_id, media_type, position }, { onConflict: 'user_id,position' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const position = searchParams.get('position')
  if (!position) return NextResponse.json({ error: 'Position gerekli.' }, { status: 400 })

  await supabase
    .from('profile_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('position', Number(position))

  return NextResponse.json({ success: true })
}
