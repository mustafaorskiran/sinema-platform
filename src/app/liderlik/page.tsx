import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Liderlik Tablosu | Sinezon',
  description: "Sinezon'un en aktif yorumcuları ve eleştirmenleri.",
}

interface Props {
  searchParams: Promise<{ kategori?: string }>
}

export default async function LiderlikPage({ searchParams }: Props) {
  const { kategori = 'yorum' } = await searchParams
  const supabase = await createClient()

  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()

  let leaders: Array<{
    username: string
    avatar_url: string | null
    full_name: string | null
    is_premium: boolean
    score: number
    detail: string
  }> = []

  if (kategori === 'yorum') {
    // Most reviews this month
    const { data } = await supabase
      .from('reviews')
      .select('user_id, profiles(username, avatar_url, full_name, is_premium)')
      .gte('created_at', monthAgo)

    const counts = new Map<string, { profile: any; count: number }>()
    for (const r of data ?? []) {
      const p = r.profiles as any
      if (!p?.username) continue
      const existing = counts.get(r.user_id)
      if (existing) existing.count++
      else counts.set(r.user_id, { profile: p, count: 1 })
    }
    leaders = Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(({ profile, count }) => ({
        username: profile.username,
        avatar_url: profile.avatar_url,
        full_name: profile.full_name,
        is_premium: profile.is_premium ?? false,
        score: count,
        detail: `${count} yorum`,
      }))
  } else if (kategori === 'begeni') {
    // Most liked reviews
    const { data } = await supabase
      .from('reviews')
      .select('user_id, likes_count, profiles(username, avatar_url, full_name, is_premium)')
      .gt('likes_count', 0)
      .order('likes_count', { ascending: false })
      .limit(100)

    const counts = new Map<string, { profile: any; total: number }>()
    for (const r of data ?? []) {
      const p = r.profiles as any
      if (!p?.username) continue
      const existing = counts.get(r.user_id)
      if (existing) existing.total += r.likes_count ?? 0
      else counts.set(r.user_id, { profile: p, total: r.likes_count ?? 0 })
    }
    leaders = Array.from(counts.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 20)
      .map(({ profile, total }) => ({
        username: profile.username,
        avatar_url: profile.avatar_url,
        full_name: profile.full_name,
        is_premium: profile.is_premium ?? false,
        score: total,
        detail: `${total} toplam beğeni`,
      }))
  } else if (kategori === 'takipci') {
    // Most followers
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, full_name, is_premium, follower_count')
      .order('follower_count', { ascending: false })
      .limit(20)

    leaders = (data ?? []).map(p => ({
      username: p.username,
      avatar_url: p.avatar_url,
      full_name: p.full_name,
      is_premium: p.is_premium ?? false,
      score: p.follower_count ?? 0,
      detail: `${p.follower_count ?? 0} takipçi`,
    }))
  } else if (kategori === 'izleme') {
    // Most diary entries
    const { data } = await supabase
      .from('diary_entries')
      .select('user_id, profiles(username, avatar_url, full_name, is_premium)')
      .gte('watched_at', new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10))

    const counts = new Map<string, { profile: any; count: number }>()
    for (const r of data ?? []) {
      const p = r.profiles as any
      if (!p?.username) continue
      const existing = counts.get(r.user_id)
      if (existing) existing.count++
      else counts.set(r.user_id, { profile: p, count: 1 })
    }
    leaders = Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(({ profile, count }) => ({
        username: profile.username,
        avatar_url: profile.avatar_url,
        full_name: profile.full_name,
        is_premium: profile.is_premium ?? false,
        score: count,
        detail: `${count} film/dizi bu yıl`,
      }))
  }

  const TABS = [
    { id: 'yorum', label: '✍️ En Çok Yorum', desc: 'Son 30 günde' },
    { id: 'begeni', label: '❤️ En Çok Beğeni', desc: 'Toplam alınan' },
    { id: 'takipci', label: '👥 En Çok Takipçi', desc: 'Tüm zamanlar' },
    { id: 'izleme', label: '🎬 En Çok İzleyen', desc: `${new Date().getFullYear()} yılında` },
  ]

  const RANK_EMOJIS = ['🥇', '🥈', '🥉']

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">🏆 Liderlik Tablosu</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sinezon'un en aktif üyeleri</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(tab => {
          const isActive = tab.id === kategori
          return (
            <Link key={tab.id} href={`/liderlik?kategori=${tab.id}`}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={isActive
                ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: 'white' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              {tab.label}
            </Link>
          )
        })}
      </div>

      <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {TABS.find(t => t.id === kategori)?.desc}
      </p>

      {/* Liste */}
      {leaders.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-4xl mb-3">📊</p>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Henüz yeterli veri yok.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.map((user, i) => (
            <Link key={user.username} href={`/profil/${user.username}`}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group hover:-translate-y-0.5"
              style={{
                background: i < 3
                  ? 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))'
                  : 'linear-gradient(160deg, rgba(20,28,47,0.8), rgba(14,20,32,0.85))',
                border: i === 0 ? '1px solid rgba(212,168,67,0.25)' :
                        i === 1 ? '1px solid rgba(192,192,192,0.2)' :
                        i === 2 ? '1px solid rgba(205,127,50,0.2)' :
                        '1px solid rgba(255,255,255,0.05)',
              }}>
              {/* Sıra */}
              <div className="w-8 text-center shrink-0">
                {i < 3
                  ? <span className="text-xl">{RANK_EMOJIS[i]}</span>
                  : <span className="text-sm font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                }
              </div>
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 relative">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>
                      {user.username[0]?.toUpperCase()}
                    </div>
                }
                {user.is_premium && (
                  <span className="absolute -bottom-0.5 -right-0.5 text-[9px]">⭐</span>
                )}
              </div>
              {/* İsim */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm group-hover:text-[--accent] transition-colors">
                  {user.full_name || `@${user.username}`}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>@{user.username}</p>
              </div>
              {/* Puan */}
              <div className="text-right shrink-0">
                <p className="text-lg font-black text-white tabular-nums">{user.score.toLocaleString('tr-TR')}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{user.detail.split(' ').slice(1).join(' ')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Saatlik güncellenir
      </p>
    </div>
  )
}
