import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VersusYeniClient from './VersusYeniClient'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations()
  return { title: t('versus.new.metaTitle') }
}

export default async function VersusYeniPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris?next=/versus/yeni')
  const { t } = await getTranslations()

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-white mb-1">⚔️ {t('versus.new.title')}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('versus.new.subtitle')}
        </p>
      </div>
      <VersusYeniClient userId={user.id} />
    </div>
  )
}
