import Link from 'next/link'
import { GENRE_MAP } from '@/lib/genres'
import { IconFilm, IconLayers, IconTv } from '@/components/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Türler' }

export default function TurlerPage() {
  const entries = Object.entries(GENRE_MAP)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <IconLayers className="h-7 w-7 text-[--accent]" />
        <h1 className="text-3xl font-bold text-white">Türler</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {entries.map(([slug, info]) => (
          <Link
            key={slug}
            href={`/tur/${slug}`}
            className="group flex items-center justify-between rounded-xl bg-[--bg-card] border border-[--border] px-4 py-3.5 hover:border-[--accent]/60 hover:bg-[--bg-card]/80 transition-all"
          >
            <span className="font-medium text-white group-hover:text-[--accent] transition-colors text-sm">
              {info.name}
            </span>
            <span className="flex items-center gap-1 text-[--text-secondary]">
              {info.movieGenreId && <IconFilm className="h-3 w-3" />}
              {info.tvGenreId && <IconTv className="h-3 w-3" />}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
