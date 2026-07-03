import Link from 'next/link'
import { GENRE_MAP } from '@/lib/genres'
import { IconFilm, IconLayers, IconTv } from '@/components/icons'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Türler | Sinezon' }

const GENRE_EMOJIS: Record<string, string> = {
  aksiyon: '💥', komedi: '😂', drama: '🎭', korku: '👻',
  gerilim: '😰', romantik: '❤️', animasyon: '🎨', belgesel: '📽️',
  bilim_kurgu: '🚀', fantezi: '🧙', macera: '🗺️', muzik: '🎵',
  tarih: '📜', suc: '🔍', aile: '👨‍👩‍👧', savas: '⚔️',
  western: '🤠', gizem: '🕵️',
}

export default async function TurlerPage() {
  const { t } = await getTranslations()
  const entries = Object.entries(GENRE_MAP)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero başlık */}
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(225,29,72,0.7)' }}>
          ✦ {t('genre.categoriesLabel')}
        </p>
        <div className="flex items-center gap-3 mb-2">
          <IconLayers className="h-7 w-7" style={{ color: 'var(--accent)' }} />
          <h1 className="text-3xl font-bold text-white">{t('genre.allGenres')}</h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('genre.pageSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {entries.map(([slug, info]) => {
          const emoji = GENRE_EMOJIS[slug] ?? '🎬'
          return (
            <Link
              key={slug}
              href={`/tur/${slug}`}
              className="group flex flex-col gap-2 rounded-xl px-4 py-4 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="font-semibold text-white group-hover:text-[--accent] transition-colors text-sm">
                {info.name}
              </span>
              <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {info.movieGenreId && <><IconFilm className="h-3 w-3" /><span className="text-[10px]">{t('genre.film')}</span></>}
                {info.movieGenreId && info.tvGenreId && <span className="text-[10px]">·</span>}
                {info.tvGenreId && <><IconTv className="h-3 w-3" /><span className="text-[10px]">{t('genre.dizi')}</span></>}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
