import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI önerisi şu an kullanılamıyor.' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const mood = (body.mood ?? '').slice(0, 100)
  const type = body.type === 'dizi' ? 'dizi' : 'film'

  // Son 20 yorumdan tür/başlık listesi al
  const { data: recentReviews } = await supabase
    .from('reviews')
    .select('media_id, media_type, rating')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const watched = (recentReviews ?? [])
    .slice(0, 8)
    .map(r => `${r.media_type}/${r.media_id} (puan: ${r.rating})`)
    .join(', ')

  const client = new Anthropic()

  const prompt = `Sen sinema uzmanı bir öneri sistemisin. Kullanıcının son izledikleri: ${watched || 'henüz yok'}.
${mood ? `Kullanıcının ruh hali/isteği: ${mood}.` : ''}
Kullanıcıya İngilizce başlık listesi değil, doğrudan Türkçe açıklamalı 3 adet ${type} öner.

Yanıtını şu JSON formatında ver (başka hiçbir şey yazma):
{"öneriler": [{"baslik": "Film Adı (Yıl)", "neden": "Kısa neden (max 80 karakter)", "genre": "Tür"}]}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Öneri üretilemedi.' }, { status: 500 })
  }
}
