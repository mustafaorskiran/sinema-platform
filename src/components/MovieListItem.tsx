import Link from 'next/link'
import { getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import { IconStarFilled } from '@/components/icons'

interface Props {
  media: any
  type: 'film' | 'dizi'
  genreIdToName: Record<number, string>
  sinemaPuan?: number | null
  sinemaVoteCount?: number
}

export default async function MovieListItem({ media, type, genreIdToName, sinemaPuan }: Props) {
  const { t }         = await getTranslations()
  const title         = getMediaTitle(media)
  const year          = getMediaYear(media)
  const poster        = getPosterUrl(media.poster_path, 'w342')
  const imdbRating    = media.vote_average != null ? Number(media.vote_average) : null
  const originalTitle = media.original_title ?? media.original_name
  const overview: string = media.overview ?? ''
  const href          = `/${type}/${media.id}`

  const genreNames: string[] = (media.genre_ids ?? [])
    .map((id: number) => genreIdToName[id])
    .filter(Boolean)
    .slice(0, 4)

  return (
    <div
      className="group flex gap-5 p-4 rounded-xl mb-2 movie-card-list"
      style={{ background: 'var(--bg-card)' }}
    >
      {/* ① POSTER */}
      <Link href={href} prefetch={false} className="shrink-0 block">
        <div
          className="w-[112px] h-[168px] rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
        >
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-[10px] text-center p-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('common.posterUnavailable')}
            </div>
          )}
        </div>
      </Link>

      {/* İçerik */}
      <div className="flex-1 min-w-0 py-1 flex flex-col gap-2.5">

        {/* ② BAŞLIK */}
        <div>
          <Link href={href} prefetch={false} className="group/title">
            <span
              className="font-bold text-[19px] leading-snug transition-colors duration-150 group-hover/title:text-white"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </span>
            {year && (
              <span
                className="text-[12px] font-normal ml-2"
                style={{ color: 'var(--text-secondary)', opacity: 0.65 }}
              >
                ({year})
              </span>
            )}
          </Link>
          {originalTitle && originalTitle !== title && (
            <p
              className="text-[11px] italic mt-0.5"
              style={{ color: 'var(--text-secondary)', opacity: 0.48 }}
            >
              {originalTitle}
            </p>
          )}
        </div>

        {/* ③ PUANLAR */}
        <div className="flex items-center gap-2 flex-wrap">
          {imdbRating !== null && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[12.5px] font-bold"
              style={{ background: '#f5c518', color: '#111' }}
            >
              <IconStarFilled size={14} /> {imdbRating.toFixed(1)}
            </span>
          )}
          {sinemaPuan ? (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[12.5px] font-bold"
              style={{
                background: 'rgba(225,29,72,0.15)',
                border: '1px solid rgba(225,29,72,0.38)',
                color: '#E11D48',
              }}
            >
              S {sinemaPuan.toFixed(1)}
            </span>
          ) : (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded text-[11px]"
              style={{
                background: 'rgba(225,29,72,0.06)',
                border: '1px solid rgba(225,29,72,0.15)',
                color: 'rgba(225,29,72,0.5)',
              }}
            >
              {t('browse.sinemaScorePending')}
            </span>
          )}
        </div>

        {/* ④ TÜRLER */}
        {genreNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {genreNames.map(name => (
              <span
                key={name}
                className="text-[12px] px-3 py-1 rounded-full font-medium"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-secondary)',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* ⑤ AÇIKLAMA */}
        {overview && (
          <p
            className="text-[12.5px] leading-relaxed line-clamp-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            {overview}
          </p>
        )}
      </div>
    </div>
  )
}
