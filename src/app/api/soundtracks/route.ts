import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const media_id = searchParams.get('media_id')
  const media_type = searchParams.get('media_type')
  if (!media_id || !media_type) return NextResponse.json([])

  const supabase = await createClient()
  const { data } = await supabase
    .from('soundtracks')
    .select('id, title, artist, spotify_url, profiles(username)')
    .eq('media_id', Number(media_id))
    .eq('media_type', media_type)
    .eq('approved', true)
    .order('created_at', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { media_id, media_type, title, artist, spotify_url } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Şarkı adı boş olamaz' }, { status: 400 })

  if (spotify_url && !spotify_url.startsWith('https://open.spotify.com/')) {
    return NextResponse.json({ error: 'Yalnızca Spotify linki ekleyebilirsin' }, { status: 400 })
  }

  const { error } = await supabase
    .from('soundtracks')
    .insert({ media_id, media_type, title: title.trim(), artist: artist?.trim() || null, spotify_url: spotify_url?.trim() || null, user_id: user.id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Şarkı incelemeye alındı.' })
}
