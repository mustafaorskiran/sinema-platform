import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Loglar' }

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  review_delete:      { label: 'Yorum Silindi',      color: 'text-red-400' },
  review_hide:        { label: 'Yorum Gizlendi',     color: 'text-yellow-400' },
  review_unhide:      { label: 'Yorum Gösterildi',   color: 'text-green-400' },
  review_note:        { label: 'Not Eklendi',         color: 'text-blue-400' },
  user_ban:           { label: 'Kullanıcı Banlandı', color: 'text-red-400' },
  user_unban:         { label: 'Ban Kaldırıldı',     color: 'text-green-400' },
  user_make_admin:    { label: 'Admin Yapıldı',       color: 'text-purple-400' },
  user_remove_admin:  { label: 'Admin Alındı',        color: 'text-orange-400' },
}

interface Props {
  searchParams: Promise<{ sayfa?: string }>
}

const PAGE_SIZE = 50

export default async function AdminLoglarPage({ searchParams }: Props) {
  await requireAdmin()
  const { sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const { data: logs, count } = await supabase
    .from('admin_logs')
    .select('*, profiles!admin_id(username)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Admin Logları</h1>
        <span className="text-sm text-[--text-secondary]">{count ?? 0} kayıt</span>
      </div>

      {!logs || logs.length === 0 ? (
        <p className="text-[--text-secondary] rounded-xl p-8 text-center"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          Henüz log kaydı yok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full text-sm">
            <thead className="text-left" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Zaman</th>
                <th className="px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Admin</th>
                <th className="px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">İşlem</th>
                <th className="px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Hedef</th>
                <th className="px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Detay</th>
              </tr>
            </thead>
            <tbody style={{ background: 'rgba(14,20,32,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              {logs.map((log: any) => {
                const meta = ACTION_LABEL[log.action]
                return (
                  <tr key={log.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-[10px] text-[--text-secondary] whitespace-nowrap font-mono">
                      {new Date(log.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-white">
                      @{log.profiles?.username ?? '?'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${meta?.color ?? 'text-[--text-secondary]'}`}>
                        {meta?.label ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-[--text-secondary] font-mono">
                      {log.target_type && <span className="mr-1 uppercase">[{log.target_type}]</span>}
                      {log.target_id?.slice(0, 16)}{log.target_id?.length > 16 ? '…' : ''}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-[--text-secondary] max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`?sayfa=${p}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-[--accent] text-white'
                  : 'bg-[--bg-card] text-[--text-secondary] hover:text-white border border-[--border]'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
