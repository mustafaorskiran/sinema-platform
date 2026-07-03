import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ArkadaOnerisiWidget from './ArkadaOnerisiWidget'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

export const metadata: Metadata = { title: 'Arkadaş Önerileri' }

export default async function ArkadaslarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')
  const { t } = await getTranslations()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">{t('social.friendSuggestions')}</h1>
      <p className="text-[--text-secondary] text-sm mb-8">{t('social.friendSuggestionsDesc')}</p>
      <ArkadaOnerisiWidget />
    </div>
  )
}
