import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const VALID_TARGET_TYPES = ['review', 'list', 'profile'] as const
const VALID_REASONS = [
  'spam',
  'harassment',
  'inappropriate',
  'spoiler',
  'misinformation',
  'other',
] as const

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  // Rate limit: 5 reports per hour
  if (!await rateLimit(`report:${user.id}`, 60 * 60_000, 5)) {
    return NextResponse.json({ error: 'Çok fazla rapor gönderdin. Lütfen bekle.' }, { status: 429 })
  }

  const { target_type, target_id, reason, details } = await req.json()

  if (!target_type || !target_id || !reason) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  }

  if (!VALID_TARGET_TYPES.includes(target_type)) {
    return NextResponse.json({ error: 'Geçersiz içerik türü' }, { status: 400 })
  }

  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: 'Geçersiz rapor nedeni' }, { status: 400 })
  }

  // Prevent duplicate reports from same user on same target
  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('target_type', target_type)
    .eq('target_id', String(target_id))
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Bu içeriği zaten raporladın.' }, { status: 409 })
  }

  await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type,
    target_id: String(target_id),
    reason,
    details: details?.trim() || null,
  })

  return NextResponse.json({ ok: true })
}
