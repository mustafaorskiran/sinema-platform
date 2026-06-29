import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { username, filmId, filmType, filmTitle, filmPoster } = await req.json()

  // Hedef kullanıcıyı bul
  const { data: target } = await supabase.from('profiles').select('id').eq('username', username).single()
  if (!target) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
  if (target.id === user.id) return NextResponse.json({ error: 'Kendinize öneremezsiniz' }, { status: 400 })

  // Konuşma bul veya oluştur
  const ids = [user.id, target.id].sort()
  let { data: conv } = await supabase.from('conversations')
    .select('id').eq('participant_1', ids[0]).eq('participant_2', ids[1]).maybeSingle()

  if (!conv) {
    const { data: newConv } = await supabase.from('conversations')
      .insert({ participant_1: ids[0], participant_2: ids[1] }).select('id').single()
    conv = newConv
  }

  if (!conv) return NextResponse.json({ error: 'Konuşma oluşturulamadı' }, { status: 500 })

  // Mesaj gönder
  await supabase.from('direct_messages').insert({
    conversation_id: conv.id,
    sender_id: user.id,
    content: `🎬 "${filmTitle}" adlı ${filmType === 'dizi' ? 'diziyi' : 'filmi'} sana önerdim!`,
    film_id: filmId,
    film_type: filmType,
    film_title: filmTitle,
    film_poster: filmPoster,
  })

  // Konuşma updated_at'ı güncelle
  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conv.id)

  return NextResponse.json({ ok: true })
}
