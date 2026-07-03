import { getTranslations } from '@/lib/i18n'
import { IconTomato, IconStarFilled } from '@/components/icons'

interface OmdbRating { Source: string; Value: string }
interface OmdbResponse { Ratings?: OmdbRating[]; imdbRating?: string; Response?: string }
interface Props { imdbId: string | null | undefined }

export default async function CriticScores({ imdbId }: Props) {
  if (!imdbId) return null
  const { t } = await getTranslations()
  let data: OmdbResponse | null = null
  try {
    const apiKey = process.env.OMDB_API_KEY ?? ''
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`, { next: { revalidate: 86400 } })
    if (res.ok) data = await res.json()
  } catch { return null }
  if (!data || data.Response === 'False') return null

  const rtValue  = data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value?.replace('%', '')
  const mcValue  = data.Ratings?.find(r => r.Source === 'Metacritic')?.Value?.split('/')[0]
  const imdbVal  = data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null
  if (!rtValue && !mcValue && !imdbVal) return null

  function rtColor(v: number) {
    if (v >= 75) return { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' }
    if (v >= 60) return { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#facc15' }
    return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' }
  }
  function mcColor(v: number) {
    if (v >= 61) return { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' }
    if (v >= 40) return { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#facc15' }
    return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' }
  }

  const rtNum = rtValue ? parseInt(rtValue) : 0
  const mcNum = mcValue ? parseInt(mcValue) : 0
  const rtC = rtValue ? rtColor(rtNum) : null
  const mcC = mcValue ? mcColor(mcNum) : null

  return (
    <div className="mt-5 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(20,28,47,0.9) 0%, rgba(14,20,32,0.95) 100%)',
        border: '1px solid rgba(212,168,67,0.1)',
      }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(212,168,67,0.08)', background: 'rgba(212,168,67,0.02)' }}>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
          {t('criticScores.title')}
        </p>
      </div>
      <div className="flex flex-wrap gap-3 p-4">
        {rtValue && rtC && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-[120px]"
            style={{ background: rtC.bg, border: `1px solid ${rtC.border}` }}>
            <IconTomato size={24} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Rotten Tomatoes</p>
              <p className="text-2xl font-black leading-none" style={{ color: rtC.text }}>{rtValue}%</p>
            </div>
          </div>
        )}
        {mcValue && mcC && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-[120px]"
            style={{ background: mcC.bg, border: `1px solid ${mcC.border}` }}>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-black bg-purple-600 shrink-0">M</span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Metacritic</p>
              <p className="text-2xl font-black leading-none" style={{ color: mcC.text }}>{mcValue}</p>
            </div>
          </div>
        )}
        {imdbVal && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-[120px]"
            style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)' }}>
            <IconStarFilled size={24} className="text-[--gold]" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>IMDb</p>
              <p className="text-2xl font-black leading-none" style={{ color: '#D4A843' }}>{imdbVal}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
