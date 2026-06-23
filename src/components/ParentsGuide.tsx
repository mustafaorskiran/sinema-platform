interface Props {
  certification: string | null
  genres: { id: number; name: string }[]
  runtime?: number | null
}

const CERT_INFO: Record<string, { label: string; color: string; desc: string }> = {
  'G':    { label: 'G', color: 'bg-green-500', desc: 'Genel izleyici' },
  'PG':   { label: 'PG', color: 'bg-yellow-500', desc: 'Ebeveyn rehberliği önerilir' },
  'PG-13':{ label: 'PG-13', color: 'bg-orange-500', desc: '13 yaş altı için uygun olmayabilir' },
  'R':    { label: 'R', color: 'bg-red-500', desc: '17 yaş altı ebeveyn eşliği gerektirir' },
  'NC-17':{ label: 'NC-17', color: 'bg-red-700', desc: '17 yaş altına yönelik değil' },
  'TV-Y': { label: 'TV-Y', color: 'bg-green-500', desc: 'Tüm çocuklar için' },
  'TV-G': { label: 'TV-G', color: 'bg-green-500', desc: 'Genel izleyici' },
  'TV-PG':{ label: 'TV-PG', color: 'bg-yellow-500', desc: 'Ebeveyn rehberliği önerilir' },
  'TV-14':{ label: 'TV-14', color: 'bg-orange-500', desc: '14 yaş altı için uygun olmayabilir' },
  'TV-MA':{ label: 'TV-MA', color: 'bg-red-500', desc: 'Yetişkinlere yönelik' },
  '7+':   { label: '7+', color: 'bg-green-500', desc: '7 yaş ve üzeri' },
  '13+':  { label: '13+', color: 'bg-yellow-500', desc: '13 yaş ve üzeri' },
  '15+':  { label: '15+', color: 'bg-orange-500', desc: '15 yaş ve üzeri' },
  '18+':  { label: '18+', color: 'bg-red-500', desc: '18 yaş ve üzeri' },
}

const VIOLENCE_GENRES = [28, 12, 53, 80, 27, 10752]
const ROMANCE_GENRES  = [10749, 35]
const HORROR_GENRES   = [27, 9648]

export default function ParentsGuide({ certification, genres, runtime }: Props) {
  if (!certification && genres.length === 0) return null

  const certInfo = certification ? CERT_INFO[certification] : null
  const genreIds = genres.map(g => g.id)

  const warnings: string[] = []
  if (genreIds.some(id => VIOLENCE_GENRES.includes(id))) warnings.push('Şiddet veya aksiyon sahneleri içerebilir')
  if (genreIds.some(id => HORROR_GENRES.includes(id))) warnings.push('Korku ve gerilim unsurları içerebilir')
  if (genreIds.some(id => ROMANCE_GENRES.includes(id))) warnings.push('Romantik içerik bulunabilir')
  if (certInfo && ['R', 'NC-17', 'TV-MA', '18+'].includes(certification!)) warnings.push('Yetişkinlere yönelik içerik')

  if (!certInfo && warnings.length === 0) return null

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-wider mb-3">İçerik Rehberi</h3>
      <div className="flex flex-wrap items-center gap-3">
        {certInfo && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${certInfo.color}/20 border border-[certInfo.color]/30`}>
            <span className={`text-sm font-bold px-1.5 py-0.5 rounded ${certInfo.color} text-white`}>
              {certInfo.label}
            </span>
            <span className="text-xs text-[--text-secondary]">{certInfo.desc}</span>
          </div>
        )}
        {warnings.map((w, i) => (
          <span key={i} className="text-xs text-[--text-secondary] bg-[--bg-card] border border-[--border] px-2.5 py-1 rounded-lg">
            ⚠️ {w}
          </span>
        ))}
      </div>
    </div>
  )
}
