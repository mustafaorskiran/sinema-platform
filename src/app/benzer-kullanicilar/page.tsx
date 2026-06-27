import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { IconUsers } from '@/components/icons'
import BenzerClient from './BenzerClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Senin Gibi Kullanıcılar | Sinezon',
  description: 'Zevklerin örtüşen kullanıcıları keşfet ve onların beğendiklerini izle.',
}

export default async function BenzerKullanicilarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  // Yeterli yüksek puan kontrolü
  const { count: highRatingCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('rating', 4)

  if ((highRatingCount ?? 0) < 3) {
    return <LowDataPage count={highRatingCount ?? 0} />
  }

  // Benzer kullanıcılar + öneri içerikleri paralel
  const [{ data: similarUsers, error: suErr }, { data: rawPicks }] = await Promise.all([
    supabase.rpc('find_similar_users', { p_user_id: user.id, p_limit: 8 }),
    supabase.rpc('get_similar_user_picks', { p_user_id: user.id, p_limit: 18 }),
  ])

  if (suErr || !similarUsers || similarUsers.length === 0) {
    return <NoSimilarUsersPage />
  }

  // TMDb verisi paralel çek (en fazla 18)
  const picks = (await Promise.all(
    (rawPicks ?? []).slice(0, 18).map(async (pick: { media_id: number; media_type: string; avg_rating: number; fan_count: number }) => {
      try {
        const media = pick.media_type === 'film'
          ? await getMovieDetail(pick.media_id)
          : await getSeriesDetail(pick.media_id)
        return {
          ...pick,
          title: getMediaTitle(media),
          year:  getMediaYear(media),
          poster: getPosterUrl(media.poster_path, 'w342'),
        }
      } catch {
        return null
      }
    })
  )).filter((p): p is NonNullable<typeof p> => p !== null)

  // Takip durumu
  const similarUserIds = similarUsers.map((u: { user_id: string }) => u.user_id)
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)
    .in('following_id', similarUserIds)

  const followingIds = (follows ?? []).map((f: { following_id: string }) => f.following_id)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <IconUsers className="h-7 w-7 text-[--accent]" />
          <h1 className="text-2xl font-bold text-white">Senin Gibi Kullanıcılar</h1>
        </div>
        <p className="text-sm text-[--text-secondary] ml-10">
          Verdiğin puanlar, izlediklerin ve listelerin üzerinden zevklerin örtüşen kullanıcılar.
        </p>
      </div>

      <BenzerClient
        similarUsers={similarUsers}
        picks={picks}
        followingIds={followingIds}
      />
    </div>
  )
}

function LowDataPage({ count }: { count: number }) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">🎬</div>
      <h1 className="text-xl font-bold text-white mb-3">Daha Fazla İçerik Puanla</h1>
      <p className="text-[--text-secondary] mb-2 text-sm leading-relaxed">
        Sana benzer kullanıcılar bulmak için en az{' '}
        <strong className="text-white">3 içeriğe ★4 veya üzeri puan</strong>{' '}
        vermen gerekiyor.
      </p>
      <p className="text-xs text-[--text-secondary] mb-8">
        Şu anda <strong className="text-white">{count}</strong> yüksek puanın var.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/filmler"
          className="px-6 py-2.5 bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold rounded-full transition-colors text-sm">
          Film Keşfet →
        </Link>
        <Link href="/diziler"
          className="px-6 py-2.5 text-white text-sm rounded-full transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Dizi Keşfet →
        </Link>
      </div>
    </div>
  )
}

function NoSimilarUsersPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">🔍</div>
      <h1 className="text-xl font-bold text-white mb-3">Benzer Kullanıcı Bulunamadı</h1>
      <p className="text-[--text-secondary] text-sm leading-relaxed mb-8">
        Henüz zevklerin örtüşen yeterli kullanıcı bulunamadı. Daha fazla içerik puanladıkça
        algoritmamız sana uygun kullanıcılar bulacak.
      </p>
      <Link href="/kullanicilar"
        className="inline-block px-6 py-2.5 rounded-xl hover:border-[--accent]/50 text-white text-sm font-medium rounded-full transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        Tüm Kullanıcıları Keşfet →
      </Link>
    </div>
  )
}
