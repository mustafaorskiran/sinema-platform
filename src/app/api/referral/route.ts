import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })
  }

  // Mevcut referral_code'u getir
  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  if (profile?.referral_code) {
    return NextResponse.json({ code: profile.referral_code })
  }

  // Yoksa benzersiz bir UUID oluştur ve kaydet
  const code = randomUUID().replace(/-/g, '').slice(0, 12)

  const { error } = await supabase
    .from('profiles')
    .update({ referral_code: code })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Kod oluşturulamadı' }, { status: 500 })
  }

  return NextResponse.json({ code })
}
