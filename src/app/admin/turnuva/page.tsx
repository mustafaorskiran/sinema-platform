import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import TurnuvaYonetim from './TurnuvaYonetim'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Turnuvalar' }

export default async function AdminTurnuvaPage() {
  await requireAdmin()
  const { t } = await getTranslations()
  const supabase = await createClient()

  const { data: tournaments } = await supabase
    .from('versus_tournaments')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t('admin.tournaments.title')}</h1>
      <TurnuvaYonetim tournaments={tournaments ?? []} />
    </div>
  )
}
