import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ yil?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return { title: `${username} — Yıl Özeti` }
}

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

export default async function YilOzetiPage({ params, searchParams }: Props) {
  const { username } = await params
  const { yil } = await searchParams
  const currentYear = new Date().getFullYear()
  const year = Math.max(2020, Math.min(currentYear, Number(yil) || currentYear))

  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('id, username').eq('username', username).single()
  if (!profile) notFound()

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const [{ data: diary }, { data: reviews }] = await Promise.all([
    supabase.from('diary_entries')
      .select('*')
      .eq('user_id', profile.id)
      .gte('watched_at', startDate)
      .lte('watched_at', endDate)
      .order('watched_at', { ascending: false }),
    supabase.from('reviews')
      .select('*')
      .eq('user_id', profile.id)
      .gte('created_at', `${year}-01-01T00:00:00`)
      .lte('created_at', `${year}-12-31T23:59:59`),
  ])

  const entries = diary ?? []
  const revs = reviews ?? []

  // Aylık dağılım
  const monthCounts = Array(12).fill(0)
  for (const e of entries) {
    const m = new Date(e.watched_at).getMonth()
    monthCounts[m]++
  }
  const maxMonthCount = Math.max(...monthCounts, 1)

  // Film vs dizi
  const filmCount = entries.filter(e => e.media_type === 'film').length
  const diziCount = entries.filter(e => e.media_type === 'dizi').length

  // Puan dağılımı
  const ratingCounts: Record<number, number> = {}
  for (const e of entries) if (e.rating) ratingCounts[e.rating] = (ratingCounts[e.rating] ?? 0) + 1
  const ratedEntries = entries.filter(e => e.rating)
  const avgRating = ratedEntries.length > 0
    ? (ratedEntries.reduce((s, e) => s + (e.rating ?? 0), 0) / ratedEntries.length).toFixed(1)
    : null

  // Rewatch sayısı
  const rewatchCount = entries.filter(e => e.is_rewatch).length

  // En yüksek puan verilen
  const bestEntry = entries.filter(e => e.rating === 10)[0]
  let bestTitle = ''
  let bestPoster = ''
  if (bestEntry) {
    try {
      const m = bestEntry.media_type === 'film'
        ? await getMovieDetail(bestEntry.media_id)
        : await getSeriesDetail(bestEntry.media_id)
      bestTitle = getMediaTitle(m)
      bestPoster = getPosterUrl(m.poster_path, 'w342') ?? ''
    } catch {}
  }

  // Toplam yorum
  const totalReviews = revs.length

  const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-[--text-secondary] mb-6">
        <Link href={`/profil/${username}`} className="hover:text-white transition-colors">← {username}</Link>
      </div>

      {/* Başlık */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">{year} Yılı Özeti</h1>
        <p className="text-[--text-secondary] text-sm mt-1">@{username}</p>
        {/* Yıl seçici */}
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {years.map(y => (
            <Link
              key={y}
              href={`/profil/${username}/yil-ozeti?yil=${y}`}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                y === year
                  ? 'bg-[--accent] text-white'
                  : 'bg-[--bg-card] border border-[--border] text-[--text-secondary] hover:text-white'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      </div>

      {entries.length === 0 && totalReviews === 0 ? (
        <div className="text-center py-16 text-[--text-secondary]">
          <p className="text-4xl mb-4">🎬</p>
          <p>{year} yılında günlük girişi bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ana istatistikler */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-[--bg-card] border border-[--border] p-4 text-center">
              <p className="text-3xl font-bold text-white">{entries.length}</p>
              <p className="text-xs text-[--text-secondary] mt-0.5">İzleme</p>
            </div>
            <div className="rounded-xl bg-[--bg-card] border border-[--border] p-4 text-center">
              <p className="text-3xl font-bold text-[--gold]">{avgRating ?? '—'}</p>
              <p className="text-xs text-[--text-secondary] mt-0.5">Ort. Puan</p>
            </div>
            <div className="rounded-xl bg-[--bg-card] border border-[--border] p-4 text-center">
              <p className="text-3xl font-bold text-white">{totalReviews}</p>
              <p className="text-xs text-[--text-secondary] mt-0.5">Yorum</p>
            </div>
            <div className="rounded-xl bg-[--bg-card] border border-[--border] p-4 text-center">
              <p className="text-3xl font-bold text-white">{rewatchCount}</p>
              <p className="text-xs text-[--text-secondary] mt-0.5">Rewatch</p>
            </div>
          </div>

          {/* Film vs Dizi */}
          {entries.length > 0 && (
            <div className="rounded-xl bg-[--bg-card] border border-[--border] p-5">
              <p className="text-sm font-semibold text-white mb-3">Film vs Dizi</p>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div className="bg-blue-500 transition-all" style={{ width: `${(filmCount / entries.length) * 100}%` }} />
                    <div className="bg-purple-500 transition-all" style={{ width: `${(diziCount / entries.length) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex gap-6 mt-3">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /><span className="text-sm text-white font-semibold">{filmCount}</span><span className="text-xs text-[--text-secondary]">Film</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /><span className="text-sm text-white font-semibold">{diziCount}</span><span className="text-xs text-[--text-secondary]">Dizi</span></div>
              </div>
            </div>
          )}

          {/* Aylık aktivite */}
          {entries.length > 0 && (
            <div className="rounded-xl bg-[--bg-card] border border-[--border] p-5">
              <p className="text-sm font-semibold text-white mb-4">Aylık Aktivite</p>
              <div className="flex items-end gap-1.5 h-28">
                {monthCounts.map((count, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-[--accent]/70 hover:bg-[--accent] transition-colors"
                      style={{ height: `${(count / maxMonthCount) * 80}px`, minHeight: count > 0 ? '4px' : '0' }}
                      title={`${MONTHS_TR[i]}: ${count} izleme`}
                    />
                    <span className="text-[9px] text-[--text-secondary]">{MONTHS_TR[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* En yüksek puan verilen */}
          {bestEntry && bestTitle && (
            <div className="rounded-xl bg-[--bg-card] border border-[--border] p-5">
              <p className="text-sm font-semibold text-white mb-3">⭐ 10 Puan Verdiğin</p>
              <Link href={`/${bestEntry.media_type}/${bestEntry.media_id}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                {bestPoster && (
                  <img src={bestPoster} alt={bestTitle} className="w-12 h-18 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-semibold text-white">{bestTitle}</p>
                  <p className="text-xs text-[--gold] mt-0.5">★ 10/10</p>
                  <p className="text-xs text-[--text-secondary]">{new Date(bestEntry.watched_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</p>
                </div>
              </Link>
              {entries.filter(e => e.rating === 10).length > 1 && (
                <p className="text-xs text-[--text-secondary] mt-2">+{entries.filter(e => e.rating === 10).length - 1} daha</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
