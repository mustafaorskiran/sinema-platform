interface OmdbRating {
  Source: string
  Value: string
}

interface OmdbResponse {
  Ratings?: OmdbRating[]
  imdbRating?: string
  Response?: string
}

interface Props {
  imdbId: string | null | undefined
}

export default async function CriticScores({ imdbId }: Props) {
  if (!imdbId) return null

  let data: OmdbResponse | null = null

  try {
    const apiKey = process.env.OMDB_API_KEY ?? ''
    const res = await fetch(
      `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`,
      { next: { revalidate: 86400 } }
    )
    if (res.ok) {
      data = await res.json()
    }
  } catch {
    return null
  }

  if (!data || data.Response === 'False') return null

  const rtRating = data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')
  const mcRating = data.Ratings?.find(r => r.Source === 'Metacritic')
  const imdbRating = data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null

  const rtValue = rtRating && rtRating.Value !== 'N/A' ? rtRating.Value : null
  const mcValue = mcRating && mcRating.Value !== 'N/A' ? mcRating.Value : null

  const hasAny = rtValue || mcValue || imdbRating
  if (!hasAny) return null

  return (
    <div className="mt-4 bg-[--bg-card] border border-[--border] rounded-2xl p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[--text-secondary] mb-3" style={{ opacity: 0.6 }}>
        Eleştirmen Skorları
      </p>
      <div className="flex flex-wrap gap-4">
        {rtValue && (
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">🍅</span>
            <div>
              <p className="text-[10px] text-[--text-secondary]">Rotten Tomatoes</p>
              <p className="text-sm font-bold text-white">{rtValue}</p>
            </div>
          </div>
        )}
        {mcValue && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-purple-600 text-white text-xs font-black leading-none shrink-0">M</span>
            <div>
              <p className="text-[10px] text-[--text-secondary]">Metacritic</p>
              <p className="text-sm font-bold text-white">{mcValue}</p>
            </div>
          </div>
        )}
        {imdbRating && (
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">⭐</span>
            <div>
              <p className="text-[10px] text-[--text-secondary]">IMDb</p>
              <p className="text-sm font-bold text-white">{imdbRating}/10</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
