import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import { IconCalendarDays, IconUsers } from '@/components/icons'
import JoinButton from './JoinButton'
import WatchPartyChat from '@/components/WatchPartyChat'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: 'Film Gecesi | SineMa' }
}

export default async function FilmGecesiDetailPage({ params }: Props) {
  const { id } = await params
  const { t } = await getTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: party } = await supabase
    .from('watch_parties')
    .select('*, profiles(username, avatar_url)')
    .eq('id', id)
    .single()

  if (!party) notFound()

  const [{ data: items }, { data: members }] = await Promise.all([
    supabase.from('watch_party_items').select('*').eq('party_id', id).order('position'),
    supabase.from('watch_party_members').select('*, profiles(username, avatar_url)').eq('party_id', id),
  ])

  const withMedia = await Promise.all(
    (items ?? []).map(async item => {
      try {
        const media = item.media_type === 'film'
          ? await getMovieDetail(item.media_id)
          : await getSeriesDetail(item.media_id)
        return { ...item, title: getMediaTitle(media), poster: getPosterUrl(media.poster_path, 'w342') }
      } catch {
        return { ...item, title: `#${item.media_id}`, poster: null }
      }
    })
  )

  const date = party.scheduled_at ? new Date(party.scheduled_at) : null
  const isJoined = user ? (members ?? []).some(m => m.user_id === user.id) : false

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/film-gecesi" className="text-sm text-[--text-secondary] hover:text-white transition-colors mb-6 inline-block">{t('filmNight.backToList')}</Link>

      <div className="rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.08)' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{party.title}</h1>
            {party.description && <p className="text-sm text-[--text-secondary] leading-relaxed">{party.description}</p>}
          </div>
          {user && <JoinButton partyId={id} initialJoined={isJoined} />}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[--text-secondary]">
          <Link href={`/profil/${party.profiles?.username}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <div className="h-6 w-6 rounded-full bg-[--accent] overflow-hidden flex items-center justify-center text-xs font-bold text-white">
              {party.profiles?.avatar_url
                ? <img src={party.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                : party.profiles?.username?.[0]?.toUpperCase()
              }
            </div>
            {party.profiles?.username}
          </Link>
          {date && (
            <span className="flex items-center gap-1.5">
              <IconCalendarDays className="h-4 w-4" />
              {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <IconUsers className="h-4 w-4" />
            {t('filmNight.participantsCount', { count: (members ?? []).length })}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* İzleme Listesi */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4">{t('filmNight.watchlistTitle')}</h2>
          {withMedia.length === 0 ? (
            <p className="text-sm text-[--text-secondary] rounded-xl p-6 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>{t('filmNight.listEmpty')}</p>
          ) : (
            <div className="space-y-2">
              {withMedia.map((item, idx) => (
                <Link key={item.id} href={`/${item.media_type}/${item.media_id}`}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:-translate-y-0.5 group"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm font-bold text-[--text-secondary] w-6 text-center shrink-0">{idx + 1}</span>
                  <div className="w-10 aspect-[2/3] rounded-lg overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {item.poster && <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />}
                  </div>
                  <p className="text-sm font-medium text-white group-hover:text-[--accent] transition-colors flex-1 truncate">{item.title}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${item.media_type === 'film' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {item.media_type === 'film' ? t('film.badge') : t('series.badge')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Katılımcılar */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">{t('filmNight.participantsTitle')}</h2>
          {(members ?? []).length === 0 ? (
            <p className="text-sm text-[--text-secondary] text-center py-4">{t('filmNight.noParticipants')}</p>
          ) : (
            <div className="space-y-2">
              {(members as any[]).map(m => (
                <Link key={m.id} href={`/profil/${m.profiles?.username}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="h-7 w-7 rounded-full bg-[--accent] overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {m.profiles?.avatar_url
                      ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      : m.profiles?.username?.[0]?.toUpperCase()
                    }
                  </div>
                  <span className="text-sm text-white">{m.profiles?.username}</span>
                  {m.user_id === party.host_id && (
                    <span className="ml-auto text-[10px] text-[--accent] font-medium">{t('filmNight.hostLabel')}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Canlı Sohbet */}
      <div className="mt-8">
        <WatchPartyChat partyId={id} currentUserId={user?.id ?? null} isMember={isJoined} />
      </div>
    </div>
  )
}
