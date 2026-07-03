import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { IconSearch, IconUsers } from '@/components/icons'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

interface Props {
  searchParams: Promise<{ q?: string; sayfa?: string }>
}

export const metadata: Metadata = { title: 'Kullanıcılar | SineMa' }

const PAGE_SIZE = 24

export default async function KullanicilarPage({ searchParams }: Props) {
  const { q, sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createClient()
  const { t } = await getTranslations()

  let query = supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, created_at', { count: 'exact' })
    .eq('banned', false)
    .order('created_at', { ascending: false })

  if (q?.trim()) {
    query = query.ilike('username', `%${q.trim()}%`)
  }

  const { data: users, count } = await query.range(offset, offset + PAGE_SIZE - 1)
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Her kullanıcı için yorum sayısı
  const ids = (users ?? []).map(u => u.id)
  const { data: reviewCounts } = ids.length > 0
    ? await supabase.from('reviews').select('user_id').in('user_id', ids)
    : { data: [] }

  const countMap: Record<string, number> = {}
  for (const r of reviewCounts ?? []) {
    countMap[r.user_id] = (countMap[r.user_id] ?? 0) + 1
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-6">
        <IconUsers className="h-7 w-7 text-[--accent]" />
        <h1 className="text-2xl font-bold text-white">{t('social.usersTitle')}</h1>
        {count != null && <span className="text-sm text-[--text-secondary]">{t('social.memberCount', { count })}</span>}
      </div>

      {/* Arama */}
      <form className="mb-8">
        <div className="relative max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-secondary]" />
          <input
            name="q"
            type="text"
            defaultValue={q ?? ''}
            placeholder={t('social.searchUsernamePlaceholder')}
            className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
          />
        </div>
      </form>

      {(!users || users.length === 0) ? (
        <div className="text-center py-20 text-[--text-secondary]">
          <IconUsers className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-white mb-1">{t('social.noUsersFound')}</p>
          {q && <p className="text-sm">{t('social.noResultsFor', { query: q })}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {users.map(user => (
            <Link key={user.id} href={`/profil/${user.username}`}
              className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-[--accent]/40 transition-all"
                style={{ background: 'var(--accent)' }}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                  : user.username[0]?.toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate transition-colors group-hover:text-[--accent]" style={{ color: 'var(--text-primary)' }}>
                  {user.username}
                </p>
                {user.bio
                  ? <p className="text-[11px] line-clamp-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{user.bio}</p>
                  : <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('social.reviewCountLabel', { count: countMap[user.id] ?? 0 })}</p>
                }
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-10">
          {page > 1 && <Link href={`/kullanicilar?${q ? `q=${encodeURIComponent(q)}&` : ''}sayfa=${page - 1}`} className="px-5 py-2 rounded-lg rounded-xl text-sm text-[--text-secondary] hover:text-white transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>← {t('social.previous')}</Link>}
          <span className="px-4 py-2 text-sm text-[--text-secondary] flex items-center">{page} / {totalPages}</span>
          {page < totalPages && <Link href={`/kullanicilar?${q ? `q=${encodeURIComponent(q)}&` : ''}sayfa=${page + 1}`} className="px-5 py-2 rounded-lg rounded-xl text-sm text-[--text-secondary] hover:text-white transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>{t('social.next')} →</Link>}
        </div>
      )}
    </div>
  )
}
