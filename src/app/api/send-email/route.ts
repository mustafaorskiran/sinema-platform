import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'bildirim@sinezon.com'

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function POST(req: NextRequest) {
  // Sadece internal API key ile çağrılabilir
  const authHeader = req.headers.get('x-internal-key') ?? ''
  const internalKey = process.env.INTERNAL_API_KEY
  if (!internalKey || !safeCompare(authHeader, internalKey)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  if (!RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { to, subject, html } = await req.json()
  if (!to || !subject || !html) return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'Geçersiz alıcı' }, { status: 400 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
