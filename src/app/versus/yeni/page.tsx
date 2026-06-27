import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VersusYeniClient from './VersusYeniClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yeni Karşılaştırma Oluştur | Sinezon',
}

export default async function VersusYeniPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris?next=/versus/yeni')

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-white mb-1">⚔️ Yeni Karşılaştırma</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          İki film seç, topluluğun oylamasını başlat
        </p>
      </div>
      <VersusYeniClient userId={user.id} />
    </div>
  )
}
