import { notFound } from 'next/navigation'
import Link from 'next/link'
import { IconGlobe, IconLock, IconPencil } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getMediaTitle, getPosterUrl } from '@/lib/tmdb'
import ListeYorumlar from './ListeYorumlar'
import ListeActions from './ListeActions'
import ListeItemsView from './ListeItemsView'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('lists')
    .select('title, cover_url, profiles(username)')
    .eq('id', id)
    .single()
  if (!data) return { title: 'Liste bulunamadı' }
  const title = data.title ?? 'Liste'
  const username = (data.profiles as any)?.username as string | undefined
  const description = username
    ? `${username} tarafından oluşturulan film & dizi listesi. Sinezon'da keşfet.`
    : 'Film ve dizi listesi. Sinezon\'da keşfet.'
  const ogImage = `/api/og?${new URLSearchParams({
    title, type: 'liste', ...(data.cover_url && { poster: data.cover_url }),
  }).toString()}`
  return {
    title,
    description,
    alternates: { canonical: `/liste/${id}` },
    openGraph: {
      title: `${title} | Sinezon`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: 'website',
      url: `/liste/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Sinezon`,
      description,
      images: [ogImage],
    },
  }
}

export default async function ListePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { t } = await getTranslations()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: list } = await supabase
    .from('lists')
    .select('*, profiles(username, avatar_url), list_likes(count), list_follows(count)')
    .eq('id', id)
    .single()

  if (!list) notFound()
  if (!list.public && list.user_id !== user?.id) notFound()

  const isOwner = user?.id === list.user_id

  const [{ data: items }, { data: comments }] = await Promise.all([
    supabase.from('list_items').select('*').eq('list_id', id).order('position', { ascending: true }),
    supabase.from('list_comments').select('*, profiles(username, avatar_url)').eq('list_id', id).order('created_at', { ascending: true }),
  ])

  // Like & follow state for current user
  let isLiked = false
  let isFollowing = false
  if (user) {
    const [{ data: likeRow }, { data: followRow }] = await Promise.all([
      supabase.from('list_likes').select('list_id').eq('list_id', id).eq('user_id', user.id).maybeSingle(),
      supabase.from('list_follows').select('list_id').eq('list_id', id).eq('user_id', user.id).maybeSingle(),
    ])
    isLiked = !!likeRow
    isFollowing = !!followRow
  }

  const likeCount   = list.list_likes?.[0]?.count ?? 0
  const followCount = list.list_follows?.[0]?.count ?? 0

  const itemsWithMedia = await Promise.all(
    (items ?? []).map(async (item, idx) => {
      try {
        const media = item.media_type === 'film'
          ? await getMovieDetail(item.media_id)
          : await getSeriesDetail(item.media_id)
        return { ...item, media, rank: idx + 1 }
      } catch {
        return { ...item, media: null, rank: idx + 1 }
      }
    })
  )

  const date = new Date(list.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      {/* ── Hero ── */}
      <div className="relative h-[50vh] min-h-[300px] max-h-[500px] overflow-hidden">
        {list.cover_url ? (
          <img
            src={list.cover_url}
            alt={list.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.72) saturate(1.05)' }}
          />
        ) : (
          <div className="absolute inset-0 flex">
            {itemsWithMedia.slice(0, 7).map((item, i, arr) => {
              const poster = item.media ? getPosterUrl(item.media.poster_path, 'w342') : null
              return (
                <div key={i} className="flex-1 overflow-hidden relative" style={{ minWidth: 0 }}>
                  {poster ? (
                    <img
                      src={poster}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover object-top"
                      style={{ filter: 'brightness(0.7)' }}
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ background: 'var(--bg-elevated)' }} />
                  )}
                  {i < arr.length - 1 && (
                    <div className="absolute top-0 bottom-0 right-0 w-[2px]" style={{ background: 'var(--bg-primary)' }} />
                  )}
                </div>
              )
            })}
            {itemsWithMedia.length === 0 && (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-secondary))' }} />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[--bg-primary] via-[--bg-primary]/50 to-[--bg-primary]/10" />
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[--bg-primary]/80 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[--bg-primary]/80 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative pb-16">

        {/* ── Header ── */}
        <div className="mb-8">

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {(list as any).is_editorial && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ background: 'rgba(225,29,72,0.9)', color: 'white' }}
              >
                ✦ {t('list.editorial')}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              {list.public
                ? <><IconGlobe className="h-3.5 w-3.5" /> {t('list.public')}</>
                : <><IconLock className="h-3.5 w-3.5" /> {t('list.private')}</>
              }
            </span>
          </div>

          {/* Başlık + düzenle */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
                {list.title}
              </h1>
              {list.description && (
                <p className="mt-3 text-[15px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                  {list.description}
                </p>
              )}
            </div>
            {isOwner && (
              <Link
                href={`/liste/${id}/duzenle`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors shrink-0 mt-3"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                <IconPencil className="h-3.5 w-3.5" />
                {t('common.edit')}
              </Link>
            )}
          </div>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 mt-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <Link href={`/profil/${list.profiles?.username}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div
                className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'var(--accent)' }}
              >
                {list.profiles?.avatar_url
                  ? <img src={list.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  : (list.profiles?.username?.[0] ?? '?').toUpperCase()
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">{list.profiles?.username}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{date}</p>
              </div>
            </Link>

            {/* İstatistik kartları */}
            <div className="flex items-center gap-2 ml-auto">
              {[
                { value: itemsWithMedia.length, label: t('list.statContent') },
                { value: likeCount,             label: t('list.statLikes')  },
                { value: followCount,           label: t('list.statFollowers') },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center px-3.5 py-2 rounded-xl"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <span className="text-base font-bold text-white leading-none">{stat.value}</span>
                  <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aksiyon butonları */}
          <div className="mt-4">
            <ListeActions
              listId={id}
              isLoggedIn={!!user}
              isOwner={isOwner}
              initialLiked={isLiked}
              initialLikeCount={likeCount}
              initialFollowing={isFollowing}
              initialFollowCount={followCount}
            />
          </div>
        </div>

        {/* ── İçerik (IMDb-style liste/grid) ── */}
        <ListeItemsView items={itemsWithMedia as any} />

        {/* ── Yorumlar ── */}
        <ListeYorumlar
          listId={id}
          initialComments={(comments ?? []) as any[]}
          currentUserId={user?.id ?? null}
        />
      </div>
    </>
  )
}
