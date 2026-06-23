import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { IconStar, IconUsers, IconMessageSquare, IconReply, IconHeart, IconUserCheck } from '@/components/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Dashboard' }

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: reviewCount },
    { count: replyCount },
    { count: likeCount },
    { count: followCount },
    { data: recentReviews },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('review_replies').select('*', { count: 'exact', head: true }),
    supabase.from('review_likes').select('*', { count: 'exact', head: true }),
    supabase.from('follows').select('*', { count: 'exact', head: true }),
    supabase.from('reviews')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('profiles')
      .select('id, username, created_at, is_admin, banned')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Kullanıcı',  value: userCount ?? 0,   icon: IconUsers,        color: 'text-blue-400'   },
    { label: 'Yorum',      value: reviewCount ?? 0,  icon: IconMessageSquare, color: 'text-green-400'  },
    { label: 'Yanıt',      value: replyCount ?? 0,   icon: IconReply,        color: 'text-purple-400' },
    { label: 'Beğeni',     value: likeCount ?? 0,    icon: IconHeart,        color: 'text-red-400'    },
    { label: 'Takip',      value: followCount ?? 0,  icon: IconUserCheck,    color: 'text-yellow-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-[--bg-card] border border-[--border] p-4">
            <Icon className={`h-5 w-5 mb-2 ${color}`} />
            <p className="text-2xl font-bold text-white">{value.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-[--text-secondary] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Son yorumlar */}
        <div className="rounded-xl bg-[--bg-card] border border-[--border] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[--border]">
            <h2 className="font-semibold text-white">Son Yorumlar</h2>
            <a href="/admin/yorumlar" className="text-xs text-[--accent] hover:underline">Tümü →</a>
          </div>
          <div className="divide-y divide-[--border]">
            {(recentReviews ?? []).map(r => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{r.profiles?.username}</p>
                  <p className="text-xs text-[--text-secondary] truncate">{r.content.slice(0, 60)}…</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <IconStar className="h-3.5 w-3.5 fill-[--gold] text-[--gold]" />
                  <span className="text-sm font-bold text-[--gold]">{r.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Son kullanıcılar */}
        <div className="rounded-xl bg-[--bg-card] border border-[--border] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[--border]">
            <h2 className="font-semibold text-white">Son Kayıtlar</h2>
            <a href="/admin/kullanicilar" className="text-xs text-[--accent] hover:underline">Tümü →</a>
          </div>
          <div className="divide-y divide-[--border]">
            {(recentUsers ?? []).map(u => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-[--accent] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{u.username}</p>
                    <p className="text-xs text-[--text-secondary]">
                      {new Date(u.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {u.is_admin && <span className="text-[10px] bg-[--accent]/20 text-[--accent] px-1.5 py-0.5 rounded font-bold">ADMİN</span>}
                  {u.banned && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">BANLANDI</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
