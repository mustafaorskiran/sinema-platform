import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { IconUsers, IconFilm, IconSearch, IconArrowRight } from '@/components/icons'
import BenzerClient from './BenzerClient'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Senin Gibi Kullanıcılar | Sinezon',
  description: 'Zevklerin örtüşen kullanıcıları keşfet ve onların beğendiklerini izle.',
}

export default async function BenzerKullanicilarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')
  const { t } = await getTranslations()

  // Yeterli yüksek puan kontrolü
  const { count: highRatingCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('rating', 4)

  if ((highRatingCount ?? 0) < 3) {
    return <LowDataPage count={highRatingCount ?? 0} t={t} />
  }

  // Benzer kullanıcılar + öneri içerikleri paralel
  const [{ data: similarUsers, error: suErr }, { data: rawPicks }] = await Promise.all([
    supabase.rpc('find_similar_users', { p_user_id: user.id, p_limit: 8 }),
    supabase.rpc('get_similar_user_picks', { p_user_id: user.id, p_limit: 18 }),
  ])

  if (suErr || !similarUsers || similarUsers.length === 0) {
    return <NoSimilarUsersPage t={t} />
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
          <h1 className="text-2xl font-bold text-white">{t('social.similarUsersTitle')}</h1>
        </div>
        <p className="text-sm text-[--text-secondary] ml-10">
          {t('social.similarUsersDesc')}
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

function LowDataPage({ count, t }: { count: number; t: (key: string, params?: Record<string, string | number>) => string }) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="mb-6 flex justify-center"><IconFilm size={56} /></div>
      <h1 className="text-xl font-bold text-white mb-3">{t('social.rateMoreTitle')}</h1>
      <p className="text-[--text-secondary] mb-2 text-sm leading-relaxed">
        {t('social.rateMoreDescPrefix')}{' '}
        <strong className="text-white">{t('social.rateMoreDescStrong')}</strong>{' '}
        {t('social.rateMoreDescSuffix')}
      </p>
      <p className="text-xs text-[--text-secondary] mb-8">
        {t('social.currentHighRatingsPrefix')} <strong className="text-white">{count}</strong> {t('social.currentHighRatingsSuffix')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/filmler"
          className="px-6 py-2.5 bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold rounded-full transition-colors text-sm inline-flex items-center justify-center gap-1.5">
          {t('social.discoverFilms')} <IconArrowRight size={14} />
        </Link>
        <Link href="/diziler"
          className="px-6 py-2.5 text-white text-sm rounded-full transition-all hover:scale-105 inline-flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {t('social.discoverSeries')} <IconArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

function NoSimilarUsersPage({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="mb-6 flex justify-center"><IconSearch size={56} /></div>
      <h1 className="text-xl font-bold text-white mb-3">{t('social.noSimilarUsersTitle')}</h1>
      <p className="text-[--text-secondary] text-sm leading-relaxed mb-8">
        {t('social.noSimilarUsersDesc')}
      </p>
      <Link href="/kullanicilar"
        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl hover:border-[--accent]/50 text-white text-sm font-medium rounded-full transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        {t('social.discoverAllUsers')} <IconArrowRight size={14} />
      </Link>
    </div>
  )
}
