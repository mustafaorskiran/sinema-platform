import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowed = await rateLimit(`ai-oneri:${user.id}`, 10 * 60 * 1000, 3)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 10 dakika bekle.' }, { status: 429 })

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI kullanılamıyor' }, { status: 503 })
  const tmdbKey = process.env.TMDB_API_KEY
  if (!tmdbKey) return NextResponse.json({ error: 'TMDB kullanılamıyor' }, { status: 503 })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('media_id, media_type, rating')
    .eq('user_id', user.id)
    .gte('rating', 7)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!reviews || reviews.length === 0) {
    return NextResponse.json({ error: 'Yeterli izleme geçmişi yok. En az 1 film/dizi değerlendirmen gerekiyor (≥7 puan).' }, { status: 400 })
  }

  const tmdbTitles: string[] = []
  for (const r of reviews.slice(0, 8)) {
    try {
      const endpoint = r.media_type === 'film' ? 'movie' : 'tv'
      const res = await fetch(`https://api.themoviedb.org/3/${endpoint}/${r.media_id}?language=tr-TR`, {
        headers: { Authorization: `Bearer ${tmdbKey}`, accept: 'application/json' },
        next: { revalidate: 3600 },
      })
      if (res.ok) {
        const d = await res.json()
        const title = d.title ?? d.name ?? d.original_title ?? d.original_name
        if (title) tmdbTitles.push(`${title} (${r.rating}/10)`)
      }
    } catch {}
  }

  if (tmdbTitles.length === 0) {
    return NextResponse.json({ error: 'Film bilgileri alınamadı.' }, { status: 500 })
  }

  const prompt = `Bir kullanıcı şu filmleri/dizileri beğeniyor (parantez içindeki sayı 10 üzerinden verdiği puan):
${tmdbTitles.map(t => `• ${t}`).join('\n')}

Bu zevke göre izlemediğini düşündüğün 5 film veya dizi öner. Her biri için:
- Başlık ve yıl
- 1-2 cümle neden önerdiğini açıkla
- Nasıl benzer olduğunu belirt

Türkçe yanıt ver. Önerileri JSON formatında döndür:
[{"title": "Film Adı (Yıl)", "reason": "Neden öneririz açıklaması"}]

Sadece JSON döndür, başka metin ekleme.`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const suggestions = JSON.parse(jsonMatch ? jsonMatch[0] : text)
    return NextResponse.json({ suggestions, basedOn: tmdbTitles.slice(0, 5) })
  } catch {
    return NextResponse.json({ error: 'AI yanıt veremedi.' }, { status: 500 })
  }
}
