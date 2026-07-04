import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import TriviaAdmin from './TriviaAdmin'

export const metadata = { title: 'Trivia Onay | Admin' }

export default async function AdminTriviaPage() {
  await requireAdmin()
  const { t } = await getTranslations()
  const supabase = await createClient()

  const { data: pending } = await supabase
    .from('trivia')
    .select('*, profiles(username)')
    .eq('approved', false)
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">{t('admin.trivia.title')}</h1>
      <p className="text-sm text-[--text-secondary] mb-8">{t('admin.trivia.pendingCount', { count: pending?.length ?? 0 })}</p>
      <TriviaAdmin items={pending ?? []} />
    </div>
  )
}
