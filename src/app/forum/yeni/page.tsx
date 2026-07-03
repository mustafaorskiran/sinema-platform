import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import NewThreadClient from './NewThreadClient'
import { getTranslations } from '@/lib/i18n'

export const metadata: Metadata = { title: 'Yeni Konu — Forum' }

interface Props {
  searchParams: Promise<{ kategori?: string }>
}

export default async function YeniKonuPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')
  const { t } = await getTranslations()

  const { kategori } = await searchParams
  const { data: categories } = await supabase
    .from('forum_categories')
    .select('id, name, icon')
    .order('order')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">{t('forum.newThreadTitle')}</h1>
      <NewThreadClient categories={categories ?? []} defaultCategoryId={kategori ? Number(kategori) : null} />
    </div>
  )
}
