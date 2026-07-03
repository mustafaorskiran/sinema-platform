import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import AdminDeleteButton from './AdminDeleteButton'
import { IconStar } from '@/components/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Yorumlar' }

interface Props {
  searchParams: Promise<{ sayfa?: string }>
}

const PAGE_SIZE = 25

export default async function AdminYorumlarPage({ searchParams }: Props) {
  await requireAdmin()
  const { t } = await getTranslations()
  const { sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const { data: reviews, count } = await supabase
    .from('reviews')
    .select('*, profiles(username)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">{t('admin.reviews.title')}</h1>
        <span className="text-sm text-[--text-secondary]">{t('admin.reviews.countLabel', { count: count ?? 0 })}</span>
      </div>

      <div className="space-y-3">
        {(reviews ?? []).map(review => (
          <div key={review.id} className="rounded-xl p-4 flex gap-4 items-start transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <a href={`/profil/${review.profiles?.username}`} className="text-sm font-semibold text-white hover:text-[--accent] transition-colors">
                  {review.profiles?.username}
                </a>
                <a href={`/${review.media_type}/${review.media_id}`} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  review.media_type === 'film' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {review.media_type} #{review.media_id}
                </a>
                <div className="flex items-center gap-1 ml-auto">
                  <IconStar className="h-3.5 w-3.5 fill-[--gold] text-[--gold]" />
                  <span className="text-sm font-bold text-[--gold]">{review.rating}/10</span>
                </div>
                <span className="text-xs text-[--text-secondary]">
                  {new Date(review.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <p className="text-sm text-[--text-secondary] line-clamp-2 leading-relaxed">{review.content}</p>
            </div>
            <AdminDeleteButton id={review.id} type="review" />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <a href={`/admin/yorumlar?sayfa=${page - 1}`}
              className="px-4 py-2 rounded-lg text-sm transition-all hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              {t('admin.users.prevPage')}
            </a>
          )}
          <span className="px-4 py-2 text-sm text-[--text-secondary] flex items-center">{page} / {totalPages}</span>
          {page < totalPages && (
            <a href={`/admin/yorumlar?sayfa=${page + 1}`}
              className="px-4 py-2 rounded-lg text-sm transition-all hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              {t('admin.users.nextPage')}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
