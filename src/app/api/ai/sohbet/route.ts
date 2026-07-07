import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const allowed = await rateLimit(`ai-sohbet:${user.id}`, 10 * 60 * 1000, 10)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. Biraz sonra tekrar dene.' }, { status: 429 })

  const { question, title, year, genres, director, mediaType } = await req.json()
  if (!question?.trim() || !title) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'AI şu an aktif değil' }, { status: 503 })

  const systemPrompt = `Sen Sinezon platformunun film ve dizi uzmanı AI asistanısın. "${title}" (${year}) ${mediaType === 'dizi' ? 'dizisi' : 'filmi'} hakkında kullanıcıların sorularını yanıtlıyorsun. Türler: ${genres}. ${director ? `Yönetmen/Yaratıcı: ${director}.` : ''} Kısa, bilgilendirici ve spoiler içermeden yanıtla. Türkçe yaz.`

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question.trim().slice(0, 500) },
      ],
    })
    const answer = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ answer })
  } catch {
    return NextResponse.json({ error: 'Yanıt alınamadı' }, { status: 500 })
  }
}
