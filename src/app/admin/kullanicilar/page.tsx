import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import AdminUserActions from './AdminUserActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Kullanıcılar' }

interface Props {
  searchParams: Promise<{ sayfa?: string; q?: string }>
}

const PAGE_SIZE = 20

export default async function AdminKullanicilarPage({ searchParams }: Props) {
  await requireAdmin()
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
        <h1 className="text-2xl font-bold text-white">Kullanıcılar</h1>
        <span className="text-sm text-[--text-secondary]">{count ?? 0} kullanıcı</span>
      </div>

      {/* Arama */}
      <form className="mb-6">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Kullanıcı adı ara..."
          className="w-full max-w-sm rounded-lg bg-[--bg-card] border border-[--border] px-4 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
        />
      </form>

      <div className="rounded-xl bg-[--bg-card] border border-[--border] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--border] text-[--text-secondary]">
              <th className="px-4 py-3 text-left font-medium">Kullanıcı</th>
              <th className="px-4 py-3 text-left font-medium">Kayıt Tarihi</th>
              <th className="px-4 py-3 text-left font-medium">Durum</th>
              <th className="px-4 py-3 text-right font-medium">İşlemler</th>
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
                      <span className="text-[10px] bg-[--accent]/20 text-[--accent] px-2 py-0.5 rounded-full font-bold">ADMİN</span>
                    )}
                    {user.banned && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">BANLANDI</span>
                    )}
                    {!user.is_admin && !user.banned && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">AKTİF</span>
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

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <a href={`/admin/kullanicilar?sayfa=${page - 1}${q ? `&q=${q}` : ''}`}
              className="px-4 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white transition-colors">
              ← Önceki
            </a>
          )}
          <span className="px-4 py-2 text-sm text-[--text-secondary] flex items-center">{page} / {totalPages}</span>
          {page < totalPages && (
            <a href={`/admin/kullanicilar?sayfa=${page + 1}${q ? `&q=${q}` : ''}`}
              className="px-4 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white transition-colors">
              Sonraki →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
