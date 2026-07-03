import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'
import DiaryPageClient from './DiaryPageClient'

export const metadata: Metadata = { title: 'Film Günlüğüm' }

interface Props {
  searchParams: Promise<{ sayfa?: string }>
}

const PAGE_SIZE = 30

export default async function GunlukPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { t } = await getTranslations()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const { sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const { data: entries, count } = await supabase
    .from('diary_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('watched_at', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // TMDb'den detayları çek
  const enriched = await Promise.all(
    (entries ?? []).map(async (entry) => {
      try {
        const detail = entry.media_type === 'film'
          ? await getMovieDetail(entry.media_id)
          : await getSeriesDetail(entry.media_id)
        return {
          ...entry,
          title: getMediaTitle(detail),
          poster: getPosterUrl(detail.poster_path, 'w342'),
        }
      } catch {
        return { ...entry, title: `#${entry.media_id}`, poster: null }
      }
    })
  )

  // Aya göre grupla
  const grouped: Record<string, typeof enriched> = {}
  for (const entry of enriched) {
    const key = entry.watched_at.slice(0, 7) // "2025-06"
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(entry)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('profile.diaryTitle')}</h1>
          <p className="text-[--text-secondary] text-sm mt-1">
            {t('profile.diaryEntryCount', { count: count ?? 0 })}
          </p>
        </div>
      </div>

      {enriched.length === 0 ? (
        <div className="rounded-2xl py-20 text-center px-6" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-4xl mb-4">📅</p>
          <p className="text-lg font-medium text-white mb-2">{t('profile.diaryEmptyTitle')}</p>
          <p className="text-sm text-[--text-secondary]">
            {t('profile.diaryEmptyDesc')}
          </p>
        </div>
      ) : (
        <DiaryPageClient
          grouped={grouped}
          totalPages={totalPages}
          currentPage={page}
        />
      )}
    </div>
  )
}
