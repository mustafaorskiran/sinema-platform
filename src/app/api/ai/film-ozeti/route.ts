import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const mediaId = req.nextUrl.searchParams.get('id')
  const mediaType = req.nextUrl.searchParams.get('type') // 'film' | 'dizi'
  const title = req.nextUrl.searchParams.get('title') ?? ''
  const year = req.nextUrl.searchParams.get('year') ?? ''
  const genres = req.nextUrl.searchParams.get('genres') ?? ''
  const director = req.nextUrl.searchParams.get('director') ?? ''

  if (!mediaId || !title) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI şu an aktif değil' }, { status: 503 })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `"${title}" (${year})${genres ? ', türler: ' + genres : ''}${director ? ', yönetmen: ' + director : ''} ${mediaType === 'dizi' ? 'dizisi' : 'filmi'} hakkında Türkçe, samimi ve ilgi çekici 2-3 cümlelik bir değerlendirme yaz. Spoiler vermeden atmosferi ve neden izlenmesi gerektiğini anlat.`,
          },
        ],
      }),
      next: { revalidate: 86400 },
    } as RequestInit)

    if (!response.ok) {
      return NextResponse.json({ error: 'AI şu an kullanılamıyor' }, { status: 500 })
    }

    const data = await response.json()
    const text: string = data.content?.[0]?.text ?? ''
    return NextResponse.json({ summary: text })
  } catch {
    return NextResponse.json({ error: 'AI şu an kullanılamıyor' }, { status: 500 })
  }
}
