import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { IconStar, IconUsers, IconMessageSquare, IconReply, IconHeart, IconUserCheck } from '@/components/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Dashboard' }

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createClient()

  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [
    { count: userCount },
    { count: reviewCount },
    { count: replyCount },
    { count: likeCount },
    { count: followCount },
    { data: recentReviews },
    { data: recentUsers },
    { count: weekReviews },
    { count: prevWeekReviews },
    { count: weekUsers },
    { data: monthlyUsersRaw },
    { data: monthlyReviewsRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('review_replies').select('*', { count: 'exact', head: true }),
    supabase.from('review_likes').select('*', { count: 'exact', head: true }),
    supabase.from('follows').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*, profiles(username)').order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id, username, created_at, is_admin, banned').order('created_at', { ascending: false }).limit(5),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', twoWeeksAgo.toISOString()).lt('created_at', oneWeekAgo.toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
    supabase.from('profiles').select('created_at').gte('created_at', new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()),
    supabase.from('reviews').select('created_at').gte('created_at', new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()),
  ])

  // Aylık kullanıcı büyüme grafiği (son 6 ay)
  const MONTHS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  const buildMonthly = (rows: { created_at: string }[] | null, months: number) => {
    const map: Record<string, number> = {}
    for (const r of rows ?? []) {
      const d = new Date(r.created_at)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      map[key] = (map[key] ?? 0) + 1
    }
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      return { label: MONTHS[d.getMonth()], count: map[key] ?? 0 }
    })
  }
  const userGrowth   = buildMonthly(monthlyUsersRaw as any, 6)
  const reviewGrowth = buildMonthly(monthlyReviewsRaw as any, 6)
  const maxUser   = Math.max(...userGrowth.map(m => m.count), 1)
  const maxReview = Math.max(...reviewGrowth.map(m => m.count), 1)

  const reviewDelta = (weekReviews ?? 0) - (prevWeekReviews ?? 0)
  const reviewTrend = reviewDelta >= 0 ? `+${reviewDelta}` : `${reviewDelta}`

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

      {/* Haftalık Özet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Bu Hafta Yorum', value: weekReviews ?? 0, sub: `${reviewTrend} geçen haftaya göre`, color: reviewDelta >= 0 ? '#4ade80' : '#f87171' },
          { label: 'Bu Hafta Kayıt', value: weekUsers ?? 0, sub: 'yeni kullanıcı', color: '#60a5fa' },
          { label: 'Ort. Puan', value: '', sub: 'genel platform', color: '#D4A843' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-5"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.08)' }}>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'rgba(212,168,67,0.4)' }}>{s.label}</p>
            <p className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{s.value || '—'}</p>
            <p className="text-[11px] font-medium" style={{ color: s.color }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Büyüme Grafikleri */}
      <div className="grid lg:grid-cols-2 gap-4 mb-8">
        {[
          { title: 'Kullanıcı Büyümesi', data: userGrowth, max: maxUser, color: '#60a5fa' },
          { title: 'Yorum Aktivitesi', data: reviewGrowth, max: maxReview, color: 'var(--accent)' },
        ].map(chart => (
          <div key={chart.title} className="rounded-xl p-5 overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-bold text-white mb-4">{chart.title}</p>
            <div className="flex items-end gap-2 h-20">
              {chart.data.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm" style={{
                    height: `${Math.max(Math.round((m.count / chart.max) * 100), m.count > 0 ? 6 : 1)}%`,
                    background: chart.color,
                    opacity: 0.4 + (i / chart.data.length) * 0.6,
                    minHeight: m.count > 0 ? '4px' : '2px',
                  }} />
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{m.label}</span>
                </div>
              ))}
            </div>
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
