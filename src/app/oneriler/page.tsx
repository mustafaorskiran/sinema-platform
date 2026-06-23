import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { discoverMovies, discoverSeries, getPosterUrl, getMovieMini, getSeriesMini, getMediaTitle } from '@/lib/tmdb'
import Link from 'next/link'
import type { Metadata } from 'next'
import { GENRE_MAP } from '@/lib/genres'

export const metadata: Metadata = { title: 'Öneriler | Sinezon' }

const MOVIE_ID_TO_GENRE: Record<number, { name: string; movieId: number; tvId: number | null; slug: string }> = {}
for (const [slug, info] of Object.entries(GENRE_MAP)) {
  if (info.movieGenreId) {
    MOVIE_ID_TO_GENRE[info.movieGenreId] = { name: info.name, movieId: info.movieGenreId, tvId: info.tvGenreId, slug }
  }
}

export default async function OnerilerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const { data: prof } = await supabase
    .from('profiles')
    .select('onboarding_completed, genre_preferences, platform_preferences')
    .eq('id', user.id)
    .maybeSingle()

  if (!prof?.onboarding_completed) {
    redirect('/onboarding')
  }

  const genrePrefs: number[] = prof.genre_preferences ?? []
  const platformPrefs: number[] = prof.platform_preferences ?? []

  // Kullanıcı geçmişi + takip listesi paralel
  const [
    { data: reviews },
    { data: watchlist },
    { data: followsData },
  ] = await Promise.all([
    supabase.from('reviews').select('media_id, media_type, rating').eq('user_id', user.id).order('rating', { ascending: false }),
    supabase.from('watchlist').select('media_id, media_type').eq('user_id', user.id).eq('status', 'izledim'),
    supabase.from('follows').select('following_id').eq('follower_id', user.id).limit(50),
  ])

  const seenIds = new Set([
    ...(reviews ?? []).map(r => r.media_id),
    ...(watchlist ?? []).map(w => w.media_id),
  ])

  const followingIds = (followsData ?? []).map((f: { following_id: string }) => f.following_id)
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null

  const filterSeen = <T extends { id: number }>(items: T[]): T[] =>
    items.filter(i => !seenIds.has(i.id)).slice(0, 12)

  const topGenres = genrePrefs.slice(0, 3).map(id => MOVIE_ID_TO_GENRE[id]).filter(Boolean)
  const topPlatforms = platformPrefs.slice(0, 2)

  // Tüm içerik önerileri + arkadaş yorumları + benzer kullanıcı picks paralel
  const [
    genreResults,
    platformResults,
    [popularMovies, topRatedMovies, popularSeries, topRatedSeries],
    friendReviewsResult,
    similarPicksResult,
  ] = await Promise.all([
    Promise.all(
      topGenres.map(g =>
        Promise.all([
          discoverMovies({ sortBy: 'popularity.desc', genre: String(g.movieId), minRating: '6' }).catch(() => ({ results: [] })),
          g.tvId
            ? discoverSeries({ sortBy: 'popularity.desc', genre: String(g.tvId), minRating: '6' }).catch(() => ({ results: [] }))
            : Promise.resolve({ results: [] }),
        ])
      )
    ),
    Promise.all(
      topPlatforms.map(pid =>
        discoverMovies({ sortBy: 'popularity.desc', provider: String(pid), minRating: '7' }).catch(() => ({ results: [] }))
      )
    ),
    Promise.all([
      discoverMovies({ sortBy: 'popularity.desc', minRating: '7' }).catch(() => ({ results: [] })),
      discoverMovies({ sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] })),
      discoverSeries({ sortBy: 'popularity.desc', minRating: '7' }).catch(() => ({ results: [] })),
      discoverSeries({ sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] })),
    ]),
    followingIds.length > 0
      ? supabase
          .from('reviews')
          .select('media_id, media_type, rating, profiles(username, avatar_url)')
          .in('user_id', followingIds)
          .gte('rating', 7)
          .gte('created_at', twoWeeksAgo)
          .order('created_at', { ascending: false })
          .limit(30)
      : Promise.resolve({ data: [] as any[] }),
    supabase.rpc('get_similar_user_picks', { p_user_id: user.id, p_limit: 6 }),
  ])

  // Arkadaş yorumlarını deduplicate + seen filtresi yaptıktan sonra TMDb detay çek
  const seenInFriendList = new Set<string>()
  const friendCandidates = (friendReviewsResult.data ?? []).filter((r: any) => {
    const key = `${r.media_type}-${r.media_id}`
    if (seenIds.has(r.media_id) || seenInFriendList.has(key)) return false
    seenInFriendList.add(key)
    return true
  }).slice(0, 8)

  type SimilarPickRaw = { media_id: number; media_type: string; avg_rating: number; fan_count: number }

  // TMDb detayları paralel: arkadaş önerileri + benzer kullanıcı picks
  const [friendItems, similarPicks] = await Promise.all([
    Promise.all(
      friendCandidates.map(async (r: any) => {
        try {
          const detail = r.media_type === 'film' ? await getMovieMini(r.media_id) : await getSeriesMini(r.media_id)
          return {
            mediaId: r.media_id as number,
            mediaType: r.media_type as 'film' | 'dizi',
            rating: r.rating as number,
            username: (r.profiles as any)?.username as string ?? 'kullanici',
            poster: detail.poster_path as string | null,
            title: getMediaTitle(detail),
          }
        } catch {
          return null
        }
      })
    ).then(results => results.filter((x): x is NonNullable<typeof x> => x !== null)),
    Promise.all(
      ((similarPicksResult.data ?? []) as SimilarPickRaw[]).slice(0, 6).map(async pick => {
        try {
          const detail = pick.media_type === 'film' ? await getMovieMini(pick.media_id) : await getSeriesMini(pick.media_id)
          return {
            mediaId: pick.media_id,
            mediaType: pick.media_type as 'film' | 'dizi',
            avgRating: pick.avg_rating,
            fanCount: pick.fan_count,
            poster: detail.poster_path as string | null,
            title: getMediaTitle(detail),
          }
        } catch {
          return null
        }
      })
    ).then(results => results.filter((x): x is NonNullable<typeof x> => x !== null)),
  ])

  const totalSeen = seenIds.size
  const totalReviews = reviews?.length ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Senin İçin Öneriler</h1>
        <p className="text-sm text-[--text-secondary] mt-1">
          {totalSeen > 0
            ? `${totalSeen} izlediğin içeriğe ve zevklerine göre hazırlandı`
            : 'Film ve dizi izledikçe öneriler daha da kişiselleşir'}
        </p>
      </div>

      {/* İstatistikler */}
      {avgRating !== null && (
        <div className="grid grid-cols-3 gap-3 mb-10">
          <StatCard label="İzlenen" value={String(totalSeen)} />
          <StatCard label="Yorum" value={String(totalReviews)} />
          <StatCard label="Ort. Puan" value={avgRating.toFixed(1)} />
        </div>
      )}

      {/* Arkadaşların Beğendikleri */}
      {friendItems.length > 0 ? (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">👥 Arkadaşların Beğendikleri</h2>
              <p className="text-xs text-[--text-secondary] mt-0.5">Takip ettiklerinin son 2 haftada yüksek puan verdiği içerikler</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {friendItems.map(item => (
              <Link key={`${item.mediaType}-${item.mediaId}`} href={`/${item.mediaType}/${item.mediaId}`} className="group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[--bg-card] border border-[--border] group-hover:border-[--accent]/50 transition-colors relative">
                  {item.poster ? (
                    <img src={getPosterUrl(item.poster, 'w342')!} alt={item.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs text-center p-1">{item.title}</div>
                  )}
                  <div className="absolute top-1 right-1 bg-black/70 rounded px-1 py-0.5 text-[10px] font-bold" style={{ color: 'var(--gold)' }}>
                    ★{item.rating}
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-[--text-secondary] line-clamp-1 group-hover:text-white transition-colors">{item.title}</p>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--accent)' }}>@{item.username}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : followingIds.length === 0 ? (
        <div className="mb-10 rounded-xl border border-[--border] bg-[--bg-card] p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-white">Arkadaşlarını takip et, önerilerini gör</p>
            <p className="text-xs text-[--text-secondary] mt-0.5">Takip ettiğin kullanıcıların beğendikleri burada görünür.</p>
          </div>
          <Link href="/kullanicilar" className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--accent)' }}>
            Kullanıcı Keşfet →
          </Link>
        </div>
      ) : null}

      {/* Senin Gibi Kullanıcılar — Mini Widget */}
      {similarPicks.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">🤝 Senin Gibi Kullanıcılar Bunu Sevdi</h2>
              <p className="text-xs text-[--text-secondary] mt-0.5">Zevklerin örtüşen kullanıcıların yüksek puan verdiği, henüz izlemediğin içerikler</p>
            </div>
            <Link href="/benzer-kullanicilar" className="text-xs whitespace-nowrap" style={{ color: 'var(--accent)' }}>
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {similarPicks.map(pick => (
              <Link key={`${pick.mediaType}-${pick.mediaId}`} href={`/${pick.mediaType}/${pick.mediaId}`} className="group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[--bg-card] border border-[--border] group-hover:border-[--accent]/50 transition-colors relative">
                  {pick.poster ? (
                    <img src={getPosterUrl(pick.poster, 'w342')!} alt={pick.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs text-center p-1">{pick.title}</div>
                  )}
                  <div className="absolute top-1 right-1 bg-black/70 rounded px-1 py-0.5 text-[10px] font-bold" style={{ color: 'var(--gold)' }}>
                    ★{pick.avgRating.toFixed(1)}
                  </div>
                  <div className="absolute bottom-1 left-1 right-1">
                    <span className="text-white text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(225,29,72,0.8)' }}>
                      {pick.fanCount} kişi
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-[--text-secondary] line-clamp-1 group-hover:text-white transition-colors">{pick.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tercih edilen tür bölümleri */}
      {topGenres.map((g, i) => {
        const [movieRes, seriesRes] = genreResults[i]
        const mixedItems = [
          ...filterSeen(movieRes.results).slice(0, 6).map(m => ({ ...m, mediaType: 'film' as const })),
          ...filterSeen(seriesRes.results).slice(0, 6).map(s => ({ ...s, mediaType: 'dizi' as const })),
        ].slice(0, 12)
        if (mixedItems.length === 0) return null
        return (
          <GenreSection
            key={g.movieId}
            title={`${genreEmoji(g.slug)} ${g.name} Seçkileri`}
            subtitle={`Beğendiğin ${g.name.toLowerCase()} türünden öneriler`}
            items={mixedItems}
            slug={g.slug}
          />
        )
      })}

      {/* Platform bazlı bölümler */}
      {topPlatforms.map((pid, i) => {
        const platformName = PLATFORM_NAMES[pid] ?? `Platform ${pid}`
        const items = filterSeen(platformResults[i].results).map(m => ({ ...m, mediaType: 'film' as const }))
        if (items.length === 0) return null
        return (
          <section key={pid} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">📺 {platformName}&apos;de Popüler</h2>
                <p className="text-xs text-[--text-secondary] mt-0.5">Üye olduğun platformdan öneriler</p>
              </div>
            </div>
            <ItemGrid items={items} />
          </section>
        )
      })}

      {/* Genel öneriler */}
      <Section title="🔥 Popüler Filmler" subtitle="Herkes için trend" items={filterSeen(popularMovies.results)} type="film" />
      <Section title="⭐ En Yüksek Puanlı Filmler" subtitle="Genel izleyici tarafından" items={filterSeen(topRatedMovies.results)} type="film" />
      <Section title="📺 Popüler Diziler" subtitle="Herkes için trend" items={filterSeen(popularSeries.results)} type="dizi" />
      <Section title="🏆 En İyi Diziler" subtitle="Genel izleyici tarafından" items={filterSeen(topRatedSeries.results)} type="dizi" />

      {/* Benzer Kullanıcılar CTA */}
      <div className="mt-12 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap" style={{ border: '1px solid rgba(225,29,72,0.3)', background: 'rgba(225,29,72,0.05)' }}>
        <div>
          <p className="text-sm font-semibold text-white">Senin Gibi Kullanıcılar Ne İzliyor?</p>
          <p className="text-xs text-[--text-secondary] mt-0.5">Puanların ve izlediklerinle örtüşen kullanıcıları keşfet, onların beğendiklerini izle.</p>
        </div>
        <Link
          href="/benzer-kullanicilar"
          className="text-sm text-white font-semibold px-5 py-2 rounded-full transition-colors whitespace-nowrap"
          style={{ background: 'var(--accent)' }}
        >
          Keşfet →
        </Link>
      </div>

      {/* Tercihlerini güncelle */}
      <div className="mt-4 rounded-xl border border-[--border] bg-[--bg-card] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-white">Öneriler beğenine uymuyor mu?</p>
          <p className="text-xs text-[--text-secondary] mt-0.5">Türlerini ve platformlarını istediğin zaman güncelleyebilirsin.</p>
        </div>
        <Link href="/profil/duzenle" className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--accent)' }}>
          Tercihlerimi Düzenle →
        </Link>
      </div>
    </div>
  )
}

// ─── Yardımcılar ─────────────────────────────────────────────────────────────

const PLATFORM_NAMES: Record<number, string> = {
  8: 'Netflix', 9: 'Amazon Prime', 337: 'Disney+', 350: 'Apple TV+',
  1899: 'Max', 341: 'Blu TV', 11: 'MUBI', 531: 'Paramount+',
  1770: 'Gain', 188: 'YouTube Premium',
}

const GENRE_EMOJIS: Record<string, string> = {
  aksiyon: '💥', komedi: '😂', drama: '🎭', korku: '👻', 'bilim-kurgu': '🚀',
  romantik: '❤️', gerilim: '😱', animasyon: '🎨', belgesel: '📷', fantezi: '🧙',
  suc: '🔫', macera: '🗺️', tarih: '📜', muzik: '🎵', aile: '👨‍👩‍👧',
  gizem: '🔍', savas: '⚔️', western: '🤠',
}

function genreEmoji(slug: string) { return GENRE_EMOJIS[slug] ?? '🎬' }

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[--border] bg-[--bg-card] p-4 text-center">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-[--text-secondary] mt-0.5">{label}</p>
    </div>
  )
}

type CardItem = {
  id: number
  poster_path: string | null
  title?: string
  name?: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  mediaType: 'film' | 'dizi'
}

function ItemGrid({ items }: { items: CardItem[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {items.map(item => (
        <Link key={`${item.mediaType}-${item.id}`} href={`/${item.mediaType}/${item.id}`} className="group">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[--bg-card] border border-[--border] group-hover:border-[--accent]/50 transition-colors relative">
            {getPosterUrl(item.poster_path, 'w342') ? (
              <img src={getPosterUrl(item.poster_path, 'w342')!} alt={item.title ?? item.name ?? ''} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs text-[--text-secondary]">{item.title ?? item.name}</div>
            )}
            <div className="absolute top-1 right-1 bg-black/70 rounded px-1 py-0.5 text-[10px] text-[--gold] font-semibold">
              {item.vote_average.toFixed(1)}
            </div>
            <div className={`absolute top-1 left-1 text-[9px] px-1 py-0.5 rounded font-medium ${item.mediaType === 'film' ? 'bg-[--accent]/80 text-white' : 'bg-blue-600/80 text-white'}`}>
              {item.mediaType === 'film' ? 'F' : 'D'}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-[--text-secondary] line-clamp-1 group-hover:text-white transition-colors">{item.title ?? item.name}</p>
        </Link>
      ))}
    </div>
  )
}

function GenreSection({ title, subtitle, items, slug }: { title: string; subtitle: string; items: CardItem[]; slug: string }) {
  if (items.length === 0) return null
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs text-[--text-secondary] mt-0.5">{subtitle}</p>
        </div>
        <Link href={`/tur/${slug}`} className="text-xs whitespace-nowrap" style={{ color: 'var(--accent)' }}>
          Tümü →
        </Link>
      </div>
      <ItemGrid items={items} />
    </section>
  )
}

function Section({ title, subtitle, items, type }: {
  title: string
  subtitle: string
  items: { id: number; poster_path: string | null; title?: string; name?: string; release_date?: string; first_air_date?: string; vote_average: number }[]
  type: 'film' | 'dizi'
}) {
  if (items.length === 0) return null
  const mapped: CardItem[] = items.map(i => ({ ...i, mediaType: type }))
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
      <p className="text-xs text-[--text-secondary] mb-4">{subtitle}</p>
      <ItemGrid items={mapped} />
    </section>
  )
}
