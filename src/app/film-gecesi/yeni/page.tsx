import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import YeniPartiForm from './YeniPartiForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Etkinlik Oluştur | SineMa' }

export default async function YeniFilmGecesiPage() {
  const supabase = await createClient()
  const { t } = await getTranslations()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">{t('filmNight.planTitle')}</h1>
      <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))', border: '1px solid rgba(212,168,67,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <YeniPartiForm />
      </div>
    </div>
  )
}
