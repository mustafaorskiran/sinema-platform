import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const targetUsername = searchParams.get('username')
  if (!targetUsername) return NextResponse.json({ error: 'username gerekli' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  // Hedef kullanıcıyı bul
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', targetUsername)
    .single()

  if (!targetProfile) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
  if (targetProfile.id === user.id) return NextResponse.json({ error: 'Kendinle karşılaştıramazsın' }, { status: 400 })

  // Her iki kullanıcının değerlendirmelerini çek
  const [{ data: myReviews }, { data: theirReviews }] = await Promise.all([
    supabase.from('reviews').select('media_id, media_type, rating').eq('user_id', user.id),
    supabase.from('reviews').select('media_id, media_type, rating').eq('user_id', targetProfile.id),
  ])

  if (!myReviews || !theirReviews) {
    return NextResponse.json({ score: 0, shared: 0, total: 0 })
  }

  // Ortak medya bul
  const myMap = new Map<string, number>()
  for (const r of myReviews) myMap.set(`${r.media_type}:${r.media_id}`, r.rating)

  const shared: { key: string; myRating: number; theirRating: number }[] = []
  for (const r of theirReviews) {
    const key = `${r.media_type}:${r.media_id}`
    if (myMap.has(key)) {
      shared.push({ key, myRating: myMap.get(key)!, theirRating: r.rating })
    }
  }

  if (shared.length === 0) {
    return NextResponse.json({ score: 0, shared: 0, total: myReviews.length + theirReviews.length, message: 'Ortak izleme yok' })
  }

  // Benzerlik skoru:
  // Her ortak medya için puan farkı 0-2 arası ise "uyumlu" sayılır
  // Skor = uyumlu sayısı / toplam ortak medya × 100
  // Ağırlıklı: aynı puan = 1.0, ±1 = 0.8, ±2 = 0.5, >2 = 0
  let weightedScore = 0
  for (const s of shared) {
    const diff = Math.abs(s.myRating - s.theirRating)
    if (diff === 0) weightedScore += 1.0
    else if (diff <= 1) weightedScore += 0.8
    else if (diff <= 2) weightedScore += 0.5
    // diff > 2: 0 puan
  }

  const score = Math.round((weightedScore / shared.length) * 100)

  return NextResponse.json({
    score,
    shared: shared.length,
    myTotal: myReviews.length,
    theirTotal: theirReviews.length,
    label: score >= 80 ? 'Sinema İkizi' : score >= 60 ? 'Uyumlu' : score >= 40 ? 'Farklı Zevkler' : 'Zıt Kutuplar',
  })
}
