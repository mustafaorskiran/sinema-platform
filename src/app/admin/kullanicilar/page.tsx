import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import AdminUserActions from './AdminUserActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Kullanıcılar' }

interface Props {
  searchParams: Promise<{ sayfa?: string; q?: string }>
}

const PAGE_SIZE = 20

export default async function AdminKullanicilarPage({ searchParams }: Props) {
  await requireAdmin()
  const { t } = await getTranslations()
  const { sayfa, q } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, username, avatar_url, is_admin, banned, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (q?.trim()) query = query.ilike('username', `%${q.trim()}%`)

  const { data: users, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">{t('admin.users.title')}</h1>
        <span className="text-sm text-[--text-secondary]">{t('admin.users.countLabel', { count: count ?? 0 })}</span>
      </div>

      {/* Arama */}
      <form className="mb-6">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder={t('admin.users.searchPlaceholder')}
          className="w-full max-w-sm rounded-lg px-4 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </form>

      <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-[--border] text-[--text-secondary]">
              <th className="px-4 py-3 text-left font-medium">{t('admin.users.colUser')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('admin.users.colJoined')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('admin.users.colStatus')}</th>
              <th className="px-4 py-3 text-right font-medium">{t('admin.users.colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border]">
            {(users ?? []).map(user => (
              <tr key={user.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[--accent] flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                      {user.avatar_url
                        ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        : user.username[0].toUpperCase()
                      }
                    </div>
                    <a href={`/profil/${user.username}`} className="font-medium text-white hover:text-[--accent] transition-colors">
                      {user.username}
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 text-[--text-secondary]">
                  {new Date(user.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {user.is_admin && (
                      <span className="text-[10px] bg-[--accent]/20 text-[--accent] px-2 py-0.5 rounded-full font-bold">{t('admin.users.badgeAdmin')}</span>
                    )}
                    {user.banned && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">{t('admin.users.badgeBanned')}</span>
                    )}
                    {!user.is_admin && !user.banned && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">{t('admin.users.badgeActive')}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminUserActions
                    userId={user.id}
                    isAdmin={user.is_admin ?? false}
                    isBanned={user.banned ?? false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <a href={`/admin/kullanicilar?sayfa=${page - 1}${q ? `&q=${q}` : ''}`}
              className="px-4 py-2 rounded-lg text-sm transition-all hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              {t('admin.users.prevPage')}
            </a>
          )}
          <span className="px-4 py-2 text-sm text-[--text-secondary] flex items-center">{page} / {totalPages}</span>
          {page < totalPages && (
            <a href={`/admin/kullanicilar?sayfa=${page + 1}${q ? `&q=${q}` : ''}`}
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
