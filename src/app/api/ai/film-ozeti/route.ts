import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import OpenAI from 'openai'

export async function GET(req: NextRequest) {
  // Bu endpoint girişsiz erişilebiliyor (her ziyaretçi film/dizi sayfasında tetikliyor) — IP bazlı sınırla
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`ai-film-ozeti:${ip}`, 60 * 1000, 20)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const mediaId = req.nextUrl.searchParams.get('id')
  const mediaType = req.nextUrl.searchParams.get('type')
  const title = req.nextUrl.searchParams.get('title') ?? ''
  const year = req.nextUrl.searchParams.get('year') ?? ''
  const genres = req.nextUrl.searchParams.get('genres') ?? ''
  const director = req.nextUrl.searchParams.get('director') ?? ''

  if (!mediaId || !title) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI şu an aktif değil' }, { status: 503 })
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `"${title}" (${year})${genres ? ', türler: ' + genres : ''}${director ? ', yönetmen: ' + director : ''} ${mediaType === 'dizi' ? 'dizisi' : 'filmi'} hakkında Türkçe, samimi ve ilgi çekici 2-3 cümlelik bir değerlendirme yaz. Spoiler vermeden atmosferi ve neden izlenmesi gerektiğini anlat.`,
        },
      ],
    })
    const text = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ summary: text })
  } catch {
    return NextResponse.json({ error: 'AI şu an kullanılamıyor' }, { status: 500 })
  }
}
