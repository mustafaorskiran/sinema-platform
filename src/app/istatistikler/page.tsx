import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconUser, IconMessageSquare, IconClipboard, IconTrendingUp } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Platform İstatistikleri | Sinezon',
  description: 'Sinezon platformunun genel istatistikleri: kullanıcı, yorum, izleme listesi verileri.',
}

async function fetchFilmTitle(mediaId: number, t: (key: string, params?: Record<string, string | number>) => string): Promise<string> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return t('stats.filmFallback', { id: mediaId })
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${mediaId}?language=tr-TR`,
      {
        headers: { Authorization: `Bearer ${apiKey}`, accept: 'application/json' },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return t('stats.filmFallback', { id: mediaId })
    const data = await res.json()
    return data.title ?? data.original_title ?? t('stats.filmFallback', { id: mediaId })
  } catch {
    return t('stats.filmFallback', { id: mediaId })
  }
}

export default async function IstatistiklerPage() {
  const { t } = await getTranslations()
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
      title: await fetchFilmTitle(id, t),
    }))
  )

  // Son 12 ay aylık yorum dağılımı
  const { data: monthlyRaw } = await supabase
    .from('reviews')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

  const monthlyMap: Record<string, number> = {}
  for (const r of monthlyRaw ?? []) {
    const d = new Date(r.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = (monthlyMap[key] ?? 0) + 1
  }
  const now = new Date()
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const MONTHS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
    return { key, label: MONTHS[d.getMonth()], count: monthlyMap[key] ?? 0 }
  })
  const maxMonthly = Math.max(...monthlyData.map(m => m.count), 1)

  const stats = [
    { label: t('stats.users'), value: userCount ?? 0, icon: IconUser, color: '#60a5fa' },
    { label: t('stats.reviews'), value: reviewCount ?? 0, icon: IconMessageSquare, color: 'var(--accent)' },
    { label: t('stats.watchlist'), value: watchlistCount ?? 0, icon: IconClipboard, color: '#a78bfa' },
    { label: t('stats.thisWeek'), value: weeklyCount ?? 0, icon: IconTrendingUp, color: '#34d399' },
  ]

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Başlık */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {t('stats.title')}
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          {t('stats.subtitle')}
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
            <div className="mb-2 flex justify-center" style={{ color: stat.color }}><stat.icon size={32} /></div>
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
          {t('stats.mostWatchedTitle')}
        </h2>
        {top5Films.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('stats.noDataYet')}</p>
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
                  {t('stats.reviewCount', { count: film.count })}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Aylık Aktivite Grafiği */}
      <div className="rounded-2xl p-6 mb-8"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.1)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #D4A843, #E11D48)' }} />
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{t('stats.monthlyActivityTitle')}</h2>
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {monthlyData.map((m) => {
            const pct = Math.round((m.count / maxMonthly) * 100)
            const isLast = m.key === monthlyData[11].key
            return (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1 group relative">
                {m.count > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(14,20,32,0.95)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.2)' }}>
                    {m.count}
                  </div>
                )}
                <div className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${Math.max(pct, m.count > 0 ? 4 : 1)}%`,
                    background: isLast
                      ? 'linear-gradient(180deg, #D4A843, rgba(212,168,67,0.4))'
                      : 'linear-gradient(180deg, rgba(225,29,72,0.7), rgba(225,29,72,0.2))',
                    minHeight: m.count > 0 ? '4px' : '2px',
                  }} />
                <span className="text-[9px] font-medium" style={{ color: isLast ? '#D4A843' : 'rgba(255,255,255,0.3)' }}>
                  {m.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bu Hafta Aktivite */}
      <div className="rounded-2xl p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)', borderLeft: '3px solid #34d399', paddingLeft: '10px' }}>
          {t('stats.thisWeek')}
        </h2>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold"
            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
            {weeklyCount ?? 0}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('stats.reviewsAdded')}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t('stats.last7Days')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
