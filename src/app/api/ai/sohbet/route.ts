import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { question, title, year, genres, director, mediaType } = await req.json()
  if (!question?.trim() || !title) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI şu an aktif değil' }, { status: 503 })

  const systemPrompt = `Sen Sinezon platformunun film ve dizi uzmanı AI asistanısın. "${title}" (${year}) ${mediaType === 'dizi' ? 'dizisi' : 'filmi'} hakkında kullanıcıların sorularını yanıtlıyorsun. Türler: ${genres}. ${director ? `Yönetmen/Yaratıcı: ${director}.` : ''} Kısa, bilgilendirici ve spoiler içermeden yanıtla. Türkçe yaz.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: question.trim().slice(0, 500) }],
      }),
    })

    if (!response.ok) throw new Error('Anthropic error')
    const data = await response.json()
    const answer = data.content?.[0]?.text ?? ''
    return NextResponse.json({ answer })
  } catch {
    return NextResponse.json({ error: 'Yanıt alınamadı' }, { status: 500 })
  }
}
