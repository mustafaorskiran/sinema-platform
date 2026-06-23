import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Platform İstatistikleri | Sinezon',
  description: 'Sinezon platformunun genel istatistikleri: kullanıcı, yorum, izleme listesi verileri.',
}

async function fetchFilmTitle(mediaId: number): Promise<string> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return `Film #${mediaId}`
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${mediaId}?language=tr-TR`,
      {
        headers: { Authorization: `Bearer ${apiKey}`, accept: 'application/json' },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return `Film #${mediaId}`
    const data = await res.json()
    return data.title ?? data.original_title ?? `Film #${mediaId}`
  } catch {
    return `Film #${mediaId}`
  }
}

export default async function IstatistiklerPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: reviewCount },
    { count: watchlistCount },
    { data: filmReviews },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('watchlist').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('media_id').eq('media_type', 'film'),
  ])

  // Bu haftanın aktivitesi
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const { count: weeklyCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString())

  // En çok izlenen filmler — JS'te frekans say
  const freqMap: Record<number, number> = {}
  for (const row of filmReviews ?? []) {
    freqMap[row.media_id] = (freqMap[row.media_id] ?? 0) + 1
  }
  const top5Ids = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id: Number(id), count }))

  const top5Films = await Promise.all(
    top5Ids.map(async ({ id, count }) => ({
      id,
      count,
      title: await fetchFilmTitle(id),
    }))
  )

  const stats = [
    { label: 'Kullanıcı', value: userCount ?? 0, icon: '👤', color: '#60a5fa' },
    { label: 'Yorum', value: reviewCount ?? 0, icon: '💬', color: 'var(--accent)' },
    { label: 'İzleme Listesi', value: watchlistCount ?? 0, icon: '📋', color: '#a78bfa' },
    { label: 'Bu Hafta', value: weeklyCount ?? 0, icon: '📈', color: '#34d399' },
  ]

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Başlık */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          Sinezon İstatistikleri
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Platformun genel rakamları
        </p>
      </div>

      {/* 4 büyük stat kutusu */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderTop: `3px solid ${stat.color}`,
            }}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
              {stat.value.toLocaleString('tr-TR')}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* En Çok İzlenen Filmler */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)', borderLeft: '3px solid var(--accent)', paddingLeft: '10px' }}>
          En Çok İzlenen Filmler
        </h2>
        {top5Films.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Henüz yeterli veri yok.</p>
        ) : (
          <div className="space-y-3">
            {top5Films.map((film, i) => (
              <a
                key={film.id}
                href={`/film/${film.id}`}
                className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
                onMouseEnter={undefined}
              >
                <span
                  className="text-lg font-extrabold w-7 shrink-0 text-center"
                  style={{ color: i === 0 ? 'var(--gold)' : 'var(--text-secondary)' }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {film.title}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(var(--accent-rgb, 225,29,72), 0.15)', color: 'var(--accent)' }}
                >
                  {film.count} yorum
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Bu Hafta Aktivite */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)', borderLeft: '3px solid #34d399', paddingLeft: '10px' }}>
          Bu Hafta
        </h2>
        <div className="flex items-center gap-4">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold"
            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
          >
            {weeklyCount ?? 0}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              yorum eklendi
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Son 7 gün içinde
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
