import Link from 'next/link'
import { IconCalendar, IconClock, IconPlay, IconStar, IconTv } from '@/components/icons'
import { discoverMovies, discoverSeries, getBackdropUrl, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import BaskaOnerButton from './BaskaOnerButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ne İzlesem?' }

interface Props {
  searchParams: Promise<{ seed?: string; tip?: string; tur?: string; puan?: string }>
}

// Basit deterministik seçici: seed + offset ile 0..max arasında sayı üretir
function pick(seed: number, offset: number, max: number): number {
  return Math.abs((seed * 1664525 + offset * 1013904223) & 0x7fffffff) % max
}

const FILM_GENRES: Record<string, { id: number; label: string }> = {
  aksiyon:    { id: 28,    label: 'Aksiyon' },
  komedi:     { id: 35,    label: 'Komedi' },
  drama:      { id: 18,    label: 'Drama' },
  korku:      { id: 27,    label: 'Korku' },
  gerilim:    { id: 53,    label: 'Gerilim' },
  romantik:   { id: 10749, label: 'Romantik' },
  animasyon:  { id: 16,    label: 'Animasyon' },
  belgesel:   { id: 99,    label: 'Belgesel' },
}

const DIZI_GENRES: Record<string, { id: number; label: string }> = {
  aksiyon:    { id: 10759, label: 'Aksiyon' },
  komedi:     { id: 35,    label: 'Komedi' },
  drama:      { id: 18,    label: 'Drama' },
  korku:      { id: 9648,  label: 'Gerilim' },
  belgesel:   { id: 99,    label: 'Belgesel' },
  animasyon:  { id: 16,    label: 'Animasyon' },
}

export default async function NeIzlesemPage({ searchParams }: Props) {
  const { seed: seedStr, tip, tur, puan } = await searchParams
  const seed = Number(seedStr) || Math.floor(Math.random() * 1_000_000)

  // Film mi dizi mi?
  const type = tip === 'film' ? 'film' : tip === 'dizi' ? 'dizi'
    : pick(seed, 0, 2) === 0 ? 'film' : 'dizi'

  // Genre
  const genres = type === 'film' ? FILM_GENRES : DIZI_GENRES
  const genreEntry = tur && genres[tur] ? genres[tur] : null
  const minRating = puan === '8' ? 8 : puan === '7' ? 7 : undefined

  // Hangi sayfadan çekeceğiz? (1-10 arası — filtreliyse daha az sayfa)
  const maxPage = genreEntry || minRating ? 5 : 20
  const page = pick(seed, 1, maxPage) + 1

  const discoverParams = {
    sortBy: 'popularity.desc',
    page,
    ...(genreEntry && { genre: String(genreEntry.id) }),
    ...(minRating && { minRating: String(minRating) }),
  }

  // Sonuçları çek
  const data = type === 'film'
    ? await discoverMovies(discoverParams).catch(() => null)
    : await discoverSeries(discoverParams).catch(() => null)

  const results = data?.results ?? []

  // Hangi indeks?
  const idx = results.length > 0 ? pick(seed, 2, results.length) : 0
  const item = results[idx] ?? null

  if (!item) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <p className="text-[--text-secondary]">Öneri yüklenemedi.</p>
        <BaskaOnerButton />
      </div>
    )
  }

  const backdrop = getBackdropUrl(item.backdrop_path, 'original')
  const poster = getPosterUrl(item.poster_path, 'w500')
  const title = getMediaTitle(item)
  const year = getMediaYear(item)
  const href = `/${type}/${item.id}`

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col">
      {/* Tam ekran backdrop */}
      {backdrop && (
        <div className="absolute inset-0 overflow-hidden">
          <img src={backdrop} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[--bg-primary] via-[--bg-primary]/70 to-[--bg-primary]/30" />
        </div>
      )}
      {!backdrop && (
        <div className="absolute inset-0 bg-gradient-to-br from-[--bg-secondary] to-[--bg-primary]" />
      )}

      {/* İçerik */}
      <div className="relative flex-1 flex flex-col justify-end max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 pt-24">

        {/* Üst etiket */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[--accent] bg-[--accent]/15 px-3 py-1 rounded-full border border-[--accent]/30">
            Ne İzlesem?
          </span>
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
            type === 'film' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
          }`}>
            {type === 'film' ? 'Film' : 'Dizi'}
          </span>
        </div>

        <div className="flex gap-6 items-end">
          {/* Poster */}
          {poster && (
            <Link href={href} className="shrink-0 hidden sm:block">
              <div className="w-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 hover:border-[--accent]/60 transition-colors">
                <img src={poster} alt={title} className="w-full aspect-[2/3] object-cover" />
              </div>
            </Link>
          )}

          {/* Bilgiler */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">
              {title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/70">
              {year && (
                <span className="flex items-center gap-1.5">
                  <IconCalendar className="h-3.5 w-3.5" />
                  {year}
                </span>
              )}
              {item.vote_average > 0 && (
                <span className="flex items-center gap-1.5">
                  <IconStar className="h-3.5 w-3.5 fill-[--gold] text-[--gold]" />
                  <span className="text-[--gold] font-semibold">{item.vote_average.toFixed(1)}</span>
                  <span className="text-white/50">TMDb</span>
                </span>
              )}
              {'runtime' in item && item.runtime ? (
                <span className="flex items-center gap-1.5">
                  <IconClock className="h-3.5 w-3.5" />
                  {String(item.runtime)} dk
                </span>
              ) : null}
              {'number_of_seasons' in item && item.number_of_seasons ? (
                <span className="flex items-center gap-1.5">
                  <IconTv className="h-3.5 w-3.5" />
                  {String(item.number_of_seasons)} sezon
                </span>
              ) : null}
            </div>

            {/* Özet */}
            {item.overview && (
              <p className="mt-4 text-white/75 leading-relaxed line-clamp-3 max-w-2xl text-sm sm:text-base">
                {item.overview}
              </p>
            )}

            {/* Butonlar */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                href={href}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              >
                <IconPlay className="h-4 w-4 fill-white" />
                Sayfaya Git
              </Link>

              <BaskaOnerButton />

              {/* Tip + puan filtreleri */}
              <div className="flex flex-wrap gap-1 ml-auto">
                <Link href={`/ne-izlesem?seed=${seed}&tip=film${tur ? `&tur=${tur}` : ''}${puan ? `&puan=${puan}` : ''}`}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${type === 'film' ? 'border-blue-400/60 text-blue-400 bg-blue-400/10' : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'}`}>Film</Link>
                <Link href={`/ne-izlesem?seed=${seed}&tip=dizi${tur ? `&tur=${tur}` : ''}${puan ? `&puan=${puan}` : ''}`}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${type === 'dizi' ? 'border-purple-400/60 text-purple-400 bg-purple-400/10' : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'}`}>Dizi</Link>
                <Link href={`/ne-izlesem?seed=${seed}&tip=${tip ?? ''}&puan=${puan === '7' ? '' : '7'}${tur ? `&tur=${tur}` : ''}`}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${puan === '7' ? 'border-[--gold]/60 text-[--gold] bg-[--gold]/10' : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'}`}>7+</Link>
                <Link href={`/ne-izlesem?seed=${seed}&tip=${tip ?? ''}&puan=${puan === '8' ? '' : '8'}${tur ? `&tur=${tur}` : ''}`}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${puan === '8' ? 'border-[--gold]/60 text-[--gold] bg-[--gold]/10' : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'}`}>8+</Link>
              </div>
            </div>

            {/* Tür filtreleri */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {Object.entries(genres).map(([slug, g]) => (
                <Link
                  key={slug}
                  href={`/ne-izlesem?seed=${seed}&tip=${type}${puan ? `&puan=${puan}` : ''}&tur=${tur === slug ? '' : slug}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    tur === slug
                      ? 'border-[--accent]/60 text-[--accent] bg-[--accent]/10'
                      : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'
                  }`}
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
