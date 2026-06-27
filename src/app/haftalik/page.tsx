import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosterUrl, getMediaTitle, getMediaYear, getMovieDetail, getSeriesDetail } from '@/lib/tmdb'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Haftanın Özeti | Sinezon',
  description: 'Bu haftanın en çok konuşulan filmleri, en aktif yorumcular ve yakında gelenler.',
}

function weekRange() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return {
    start: monday.toISOString(),
    end: sunday.toISOString(),
    label: `${monday.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} – ${sunday.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  }
}

const TMDB_BASE = 'https://api.themoviedb.org/3'

async function fetchTrendingWeek(apiKey: string) {
  try {
    const r = await fetch(`${TMDB_BASE}/trending/all/week?language=tr-TR`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 },
    })
    if (!r.ok) return []
    const d = await r.json()
    return (d.results ?? []).slice(0, 5)
  } catch { return [] }
}

export default async function HaftalikPage() {
  const { start, label } = weekRange()
  const supabase = await createClient()
  const apiKey = process.env.TMDB_API_KEY ?? ''

  const [
    { data: topReviewsRaw },
    { data: activeUsersRaw },
    { data: newListsRaw },
    trendingAll,
  ] = await Promise.all([
    // En beğenilen yorumlar bu hafta
    supabase
      .from('reviews')
      .select('id, media_id, media_type, content, rating, likes_count, created_at, profiles(username, avatar_url)')
      .gte('created_at', start)
      .not('content', 'is', null)
      .neq('content', '')
      .order('likes_count', { ascending: false })
      .limit(5),
    // En aktif yorumcular bu hafta
    supabase
      .from('reviews')
      .select('user_id, profiles(username, avatar_url)')
      .gte('created_at', start)
      .limit(500),
    // Yeni oluşturulan listeler bu hafta
    supabase
      .from('lists')
      .select('id, title, created_at, profiles(username)')
      .gte('created_at', start)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5),
    fetchTrendingWeek(apiKey),
  ])

  // Aktif kullanıcı sıralaması
  const userCountMap: Record<string, { username: string; avatar_url: string | null; count: number }> = {}
  for (const r of activeUsersRaw ?? []) {
    const p = r.profiles as any
    const uid = (r as any).user_id
    if (!p?.username || !uid) continue
    if (!userCountMap[uid]) userCountMap[uid] = { username: p.username, avatar_url: p.avatar_url, count: 0 }
    userCountMap[uid].count++
  }
  const activeUsers = Object.values(userCountMap).sort((a, b) => b.count - a.count).slice(0, 5)

  // Top yorum TMDB detay
  const topReviews = await Promise.all(
    (topReviewsRaw ?? []).map(async (r: any) => {
      try {
        const detail = r.media_type === 'film' ? await getMovieDetail(r.media_id) : await getSeriesDetail(r.media_id)
        return { ...r, mediaTitle: getMediaTitle(detail), mediaPoster: detail.poster_path ? getPosterUrl(detail.poster_path, 'w342') : null }
      } catch { return { ...r, mediaTitle: `#${r.media_id}`, mediaPoster: null } }
    })
  )

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(212,168,67,0.6)' }}>
          Haftalık Özet
        </p>
        <h1 className="text-3xl font-black text-white mb-1">📰 Bu Haftanın Özeti</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol kolon: trend + listeler */}
        <div className="lg:col-span-2 space-y-6">

          {/* TMDb Trendleri */}
          {trendingAll.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                🔥 Bu Hafta Trend
              </h2>
              <div className="space-y-2">
                {trendingAll.map((item: any, i: number) => {
                  const type = item.media_type === 'tv' ? 'dizi' : 'film'
                  const title = item.title ?? item.name ?? ''
                  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)
                  return (
                    <Link key={item.id} href={`/${type}/${item.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl transition-all hover:-translate-y-0.5 group"
                      style={card}>
                      <span className="w-7 text-center font-black tabular-nums text-sm shrink-0"
                        style={{ color: i < 3 ? '#D4A843' : 'rgba(255,255,255,0.25)' }}>
                        {i + 1}
                      </span>
                      <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {item.poster_path && (
                          <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={title}
                            className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm group-hover:text-[--accent] transition-colors line-clamp-1">
                          {title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {type === 'film' ? '🎬' : '📺'} {year}
                          {item.vote_average > 0 && ` · ★ ${item.vote_average.toFixed(1)}`}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <Link href="/top10" className="inline-block mt-3 text-xs hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                Tüm Top 10 →
              </Link>
            </section>
          )}

          {/* En Beğenilen Yorumlar */}
          {topReviews.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                💬 Haftanın En Beğenilen Yorumları
              </h2>
              <div className="space-y-3">
                {topReviews.map((r: any) => (
                  <div key={r.id} className="flex gap-3 p-4 rounded-xl" style={card}>
                    {r.mediaPoster && (
                      <img src={r.mediaPoster} alt={r.mediaTitle}
                        className="w-10 h-14 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/profil/${(r.profiles as any)?.username}`}
                          className="text-xs font-bold text-white hover:text-[--accent] transition-colors">
                          @{(r.profiles as any)?.username}
                        </Link>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843' }}>
                          ★ {r.rating}/10
                        </span>
                        {r.likes_count > 0 && (
                          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            ❤️ {r.likes_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {r.content}
                      </p>
                      <Link href={`/${r.media_type}/${r.media_id}`}
                        className="text-[10px] mt-1 hover:text-white transition-colors block"
                        style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {r.mediaTitle} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Yeni Listeler */}
          {(newListsRaw ?? []).length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                📋 Bu Hafta Oluşturulan Listeler
              </h2>
              <div className="space-y-2">
                {(newListsRaw ?? []).map((l: any) => (
                  <Link key={l.id} href={`/liste/${l.id}`}
                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:-translate-y-0.5 group"
                    style={card}>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-[--accent] transition-colors">
                        {l.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        @{(l.profiles as any)?.username}
                      </p>
                    </div>
                    <span className="text-white/20 text-xs">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sağ kolon: aktif kullanıcılar + hızlı linkler */}
        <div className="space-y-6">

          {/* En Aktif Kullanıcılar */}
          {activeUsers.length > 0 && (
            <section className="p-5 rounded-2xl" style={card}>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                ✍️ Bu Haftanın Yorumcuları
              </h2>
              <div className="space-y-3">
                {activeUsers.map((u, i) => (
                  <Link key={u.username} href={`/profil/${u.username}`}
                    className="flex items-center gap-3 group">
                    <span className="w-5 text-center text-xs font-black shrink-0"
                      style={{ color: i < 3 ? '#D4A843' : 'rgba(255,255,255,0.2)' }}>
                      {i + 1}
                    </span>
                    <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: u.avatar_url ? 'transparent' : 'linear-gradient(135deg, #E11D48, #be123c)' }}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                        : u.username[0]?.toUpperCase()
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-[--accent] transition-colors truncate">
                        @{u.username}
                      </p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {u.count} yorum
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/liderlik" className="block mt-4 text-xs text-center hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.25)' }}>
                Liderlik Tablosu →
              </Link>
            </section>
          )}

          {/* Hızlı Bağlantılar */}
          <section className="p-5 rounded-2xl" style={card}>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              🔗 Keşfet
            </h2>
            <div className="space-y-2">
              {[
                { href: '/yakinda', label: '📅 Yakında Çıkacaklar' },
                { href: '/top10', label: '🔥 Haftanın Top 10\'u' },
                { href: '/liderlik', label: '🏆 Liderlik Tablosu' },
                { href: '/ne-izlesem', label: '🎲 Ne İzlesem?' },
                { href: '/forum', label: '💬 Tartışma Forumu' },
                { href: '/oneri', label: '🤖 AI Öneri Al' },
              ].map(link => (
                <Link key={link.href} href={link.href}
                  className="block text-sm py-2 px-3 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          {/* Özet Bilgisi */}
          <div className="text-center">
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Saatlik güncellenir
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
