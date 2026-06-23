import Link from 'next/link'
import Image from 'next/image'
import { IconStarFilled } from '@/components/icons'
import { getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb-utils'
import type { TMDbMovie } from '@/lib/types'
import QuickActions from './QuickActions'

interface MovieCardProps {
  media: TMDbMovie
  type: 'film' | 'dizi'
}

export default function MovieCard({ media, type }: MovieCardProps) {
  const title  = getMediaTitle(media)
  const year   = getMediaYear(media)
  const poster = getPosterUrl(media.poster_path, 'w342')
  const rating = media.vote_average.toFixed(1)

  return (
    <div className="group">
      <Link href={`/${type}/${media.id}`} className="block">
        <div
          className="relative overflow-hidden rounded-xl transition-transform duration-300 group-hover:-translate-y-2 movie-card-grid"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Poster */}
          <div className="aspect-[2/3] relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            {poster ? (
              <Image
                src={poster}
                alt={title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                Afiş yok
              </div>
            )}

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Rating badge */}
            <div
              className="absolute top-2 right-2 flex items-center gap-1 rounded-md px-2 py-1 backdrop-blur-sm"
              style={{
                background: 'rgba(11,15,25,0.92)',
                border: '1px solid rgba(212,168,67,0.45)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
              }}
            >
              <IconStarFilled className="h-3 w-3" style={{ color: 'var(--gold)' }} />
              <span className="text-[12px] font-bold tracking-tight" style={{ color: 'var(--gold-bright)' }}>{rating}</span>
            </div>
          </div>

          {/* Info */}
          <div className="px-3.5 pt-3 pb-3.5">
            <h3
              className="text-[14px] font-semibold leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-white"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h3>
            {year && (
              <p className="mt-1 text-[11px]" style={{ color: 'var(--text-secondary)', opacity: 0.65 }}>{year}</p>
            )}
          </div>

          {/* Bottom accent line on hover */}
          <div
            className="absolute bottom-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(90deg, var(--accent), var(--gold))' }}
          />
        </div>
      </Link>

      <QuickActions mediaId={media.id} type={type} />
    </div>
  )
}
