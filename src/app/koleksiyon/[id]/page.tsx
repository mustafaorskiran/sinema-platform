import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCollection } from '@/lib/tmdb'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const col = await getCollection(Number(id))
    return { title: `${col.name} | SineMa` }
  } catch {
    return { title: 'Koleksiyon | SineMa' }
  }
}

export default async function KoleksiyonPage({ params }: Props) {
  const { id } = await params
  const colId = Number(id)
  if (!colId) notFound()

  const col = await getCollection(colId).catch(() => null)
  if (!col) notFound()

  const sorted = [...col.parts].sort((a, b) =>
    (a.release_date ?? '').localeCompare(b.release_date ?? '')
  )

  const totalVote = sorted.reduce((s, p) => s + p.vote_average, 0)
  const avgVote = sorted.length > 0 ? totalVote / sorted.length : 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Backdrop */}
      {col.backdrop_path && (
        <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-8 relative">
          <img src={`https://image.tmdb.org/t/p/w1280${col.backdrop_path}`} alt={col.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[--bg-primary] via-[--bg-primary]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">{col.name}</h1>
          </div>
        </div>
      )}

      {!col.backdrop_path && (
        <h1 className="text-3xl font-bold text-white mb-4">{col.name}</h1>
      )}

      {/* İstatistikler */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="rounded-xl bg-[--bg-card] border border-[--border] px-5 py-3 text-center">
          <p className="text-xl font-bold text-white">{sorted.length}</p>
          <p className="text-xs text-[--text-secondary]">Film</p>
        </div>
        {avgVote > 0 && (
          <div className="rounded-xl bg-[--bg-card] border border-[--border] px-5 py-3 text-center">
            <p className="text-xl font-bold text-[--gold]">★ {avgVote.toFixed(1)}</p>
            <p className="text-xs text-[--text-secondary]">Ortalama Puan</p>
          </div>
        )}
        {sorted[0]?.release_date && (
          <div className="rounded-xl bg-[--bg-card] border border-[--border] px-5 py-3 text-center">
            <p className="text-xl font-bold text-white">{sorted[0].release_date.slice(0, 4)}</p>
            <p className="text-xs text-[--text-secondary]">İlk Film</p>
          </div>
        )}
      </div>

      {col.overview && (
        <p className="text-sm text-[--text-secondary] leading-relaxed mb-8 max-w-3xl">{col.overview}</p>
      )}

      {/* Film listesi */}
      <h2 className="text-xl font-bold text-white mb-5">Filmler</h2>
      <div className="space-y-3">
        {sorted.map((part, idx) => (
          <Link key={part.id} href={`/film/${part.id}`}
            className="flex items-center gap-4 p-3 rounded-xl bg-[--bg-card] border border-[--border] hover:border-[--accent]/40 transition-colors group">
            <span className="text-sm font-bold text-[--text-secondary] w-8 text-center shrink-0">{idx + 1}</span>
            <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-[--bg-secondary]">
              {part.poster_path && (
                <img src={`https://image.tmdb.org/t/p/w342${part.poster_path}`} alt={part.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-[--accent] transition-colors truncate">{part.title}</p>
              <p className="text-xs text-[--text-secondary] mt-0.5 line-clamp-2 leading-relaxed">{part.overview?.slice(0, 120)}{part.overview && part.overview.length > 120 ? '…' : ''}</p>
            </div>
            <div className="shrink-0 text-right">
              {part.vote_average > 0 && (
                <p className="text-sm font-bold text-[--gold]">★ {part.vote_average.toFixed(1)}</p>
              )}
              {part.release_date && (
                <p className="text-xs text-[--text-secondary] mt-0.5">{part.release_date.slice(0, 4)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
