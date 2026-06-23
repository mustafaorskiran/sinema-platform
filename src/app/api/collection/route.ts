import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([])

  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  let userId = user.id
  if (username) {
    const { data: profile } = await supabase.from('profiles').select('id').eq('username', username).single()
    if (profile) userId = profile.id
  }

  const { data } = await supabase
    .from('collection')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })

  const { media_id, media_type, format = 'dijital' } = await request.json()
  if (!media_id || !media_type) return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 })

  const { data, error } = await supabase
    .from('collection')
    .upsert({ user_id: user.id, media_id, media_type, format }, { onConflict: 'user_id,media_id,media_type' })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const media_id = searchParams.get('media_id')
  const media_type = searchParams.get('media_type')

  await supabase.from('collection').delete()
    .eq('user_id', user.id)
    .eq('media_id', Number(media_id))
    .eq('media_type', media_type!)

  return NextResponse.json({ success: true })
}
