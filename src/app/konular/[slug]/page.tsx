import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import Link from 'next/link'
import type { Metadata } from 'next'
import TopicVoteClient from './TopicVoteClient'
import { getTranslations } from '@/lib/i18n'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('topics').select('name').eq('slug', slug).single()
  return { title: data ? `${data.name} — Konular` : 'Konular' }
}

export default async function KonuDetayPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { t } = await getTranslations()

  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!topic) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // En çok oylanan içerikler (oy sayısına göre grupla)
  const { data: votes } = await supabase
    .from('topic_votes')
    .select('media_id, media_type')
    .eq('topic_id', topic.id)

  // media_id + media_type kombinasyonuna göre say
  const countMap: Record<string, { media_id: number; media_type: string; count: number }> = {}
  for (const v of votes ?? []) {
    const key = `${v.media_type}-${v.media_id}`
    if (!countMap[key]) countMap[key] = { media_id: v.media_id, media_type: v.media_type, count: 0 }
    countMap[key].count++
  }
  const sorted = Object.values(countMap).sort((a, b) => b.count - a.count).slice(0, 24)

  // TMDb'den detayları çek
  const mediaList = await Promise.all(
    sorted.map(async (item) => {
      try {
        const detail = item.media_type === 'film'
          ? await getMovieDetail(item.media_id)
          : await getSeriesDetail(item.media_id)
        return { ...item, detail }
      } catch {
        return { ...item, detail: null }
      }
    })
  )

  // Kullanıcının bu konudaki oyları
  let userVotes: number[] = []
  if (user) {
    const { data: uv } = await supabase
      .from('topic_votes')
      .select('media_id')
      .eq('topic_id', topic.id)
      .eq('user_id', user.id)
    userVotes = (uv ?? []).map(v => v.media_id)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-[--text-secondary] mb-6">
        <Link href="/konular" className="hover:text-white transition-colors">← {t('community.topicsTitle')}</Link>
      </div>

      {/* Başlık */}
      <div className="flex items-center gap-4 mb-3">
        <span className="text-5xl">{topic.emoji}</span>
        <div>
          {topic.is_featured && (
            <span className="text-xs font-bold uppercase tracking-widest text-[--accent] block mb-1">{t('community.topicOfTheWeek')}</span>
          )}
          <h1 className="text-3xl font-bold text-white">{topic.name}</h1>
          <p className="text-[--text-secondary] text-sm mt-1">{topic.description}</p>
        </div>
      </div>

      <p className="text-sm text-[--text-secondary] mb-8">
        {sorted.length > 0
          ? t('community.taggedByCommunity', { count: sorted.reduce((s, i) => s + i.count, 0) })
          : t('community.noTopicTags')}
      </p>

      {/* İçerik ızgarası */}
      {mediaList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaList.map(({ detail, media_id, media_type, count }) => {
            if (!detail) return null
            const poster = getPosterUrl(detail.poster_path, 'w342')
            const title = getMediaTitle(detail)
            const year = getMediaYear(detail)
            const voted = userVotes.includes(media_id)
            return (
              <div key={`${media_type}-${media_id}`} className="group relative">
                <Link href={`/${media_type}/${media_id}`} prefetch={false}>
                  <div className="aspect-[2/3] rounded-xl overflow-hidden rounded-xl group-hover:border-[--accent]/40 transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {poster
                      ? <img src={poster} alt={title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                      : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-2 text-center">{title}</div>
                    }
                  </div>
                  <p className="mt-1.5 text-xs text-white font-medium line-clamp-1">{title}</p>
                  <p className="text-xs text-[--text-secondary]">{year}</p>
                </Link>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[--text-secondary]">{t('community.voteCount', { count })}</span>
                  {user && (
                    <TopicVoteClient
                      topicId={topic.id}
                      mediaId={media_id}
                      mediaType={media_type}
                      initialVoted={voted}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl py-16 text-center" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-4xl mb-4">{topic.emoji}</p>
          <p className="text-[--text-secondary] text-sm">
            {t('community.topicEmpty')}
          </p>
          <p className="text-xs text-[--text-secondary] mt-2">
            {t('community.topicEmptyHint')}
          </p>
        </div>
      )}
    </div>
  )
}
