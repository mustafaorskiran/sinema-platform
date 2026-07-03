import { getTranslations } from '@/lib/i18n'

interface Props {
  certification: string | null
  genres: { id: number; name: string }[]
  runtime?: number | null
}

const CERT_INFO: Record<string, { label: string; color: string; bg: string; border: string; descKey: string }> = {
  'G':     { label: 'G',     color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   descKey: 'generalAudience' },
  'PG':    { label: 'PG',    color: '#facc15', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)',   descKey: 'parentalGuidanceSuggested' },
  'PG-13': { label: 'PG-13', color: '#fb923c', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  descKey: 'under13NotSuitable' },
  'R':     { label: 'R',     color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   descKey: 'under17NeedsGuardian' },
  'NC-17': { label: 'NC-17', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.3)',   descKey: 'notForUnder17' },
  'TV-Y':  { label: 'TV-Y',  color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   descKey: 'allChildren' },
  'TV-G':  { label: 'TV-G',  color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   descKey: 'generalAudience' },
  'TV-PG': { label: 'TV-PG', color: '#facc15', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)',   descKey: 'parentalGuidanceSuggested' },
  'TV-14': { label: 'TV-14', color: '#fb923c', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  descKey: 'under14NotSuitable' },
  'TV-MA': { label: 'TV-MA', color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   descKey: 'adultOriented' },
  '7+':    { label: '7+',    color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   descKey: 'age7Plus' },
  '13+':   { label: '13+',   color: '#facc15', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)',   descKey: 'age13Plus' },
  '15+':   { label: '15+',   color: '#fb923c', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  descKey: 'age15Plus' },
  '18+':   { label: '18+',   color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   descKey: 'age18Plus' },
}

const VIOLENCE_GENRES = [28, 12, 53, 80, 27, 10752]
const ROMANCE_GENRES  = [10749, 35]
const HORROR_GENRES   = [27, 9648]

export default async function ParentsGuide({ certification, genres }: Props) {
  if (!certification && genres.length === 0) return null
  const { t } = await getTranslations()
  const certInfo = certification ? CERT_INFO[certification] : null
  const genreIds = genres.map(g => g.id)
  const warnings: { icon: string; textKey: string }[] = []
  if (genreIds.some(id => VIOLENCE_GENRES.includes(id))) warnings.push({ icon: '⚔️', textKey: 'violenceWarning' })
  if (genreIds.some(id => HORROR_GENRES.includes(id)))   warnings.push({ icon: '👻', textKey: 'horrorWarning' })
  if (genreIds.some(id => ROMANCE_GENRES.includes(id)))  warnings.push({ icon: '💕', textKey: 'romanceWarning' })
  if (certInfo && ['R', 'NC-17', 'TV-MA', '18+'].includes(certification!)) warnings.push({ icon: '🔞', textKey: 'adultContentWarning' })
  if (!certInfo && warnings.length === 0) return null

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
          {t('parentsGuide.title')}
        </p>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,168,67,0.15) 0%, transparent 100%)' }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {certInfo && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{ background: certInfo.bg, border: `1px solid ${certInfo.border}` }}>
            <span className="text-xl font-black leading-none" style={{ color: certInfo.color }}>{certInfo.label}</span>
            <div className="w-px h-4" style={{ background: certInfo.border }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{t(`parentsGuide.${certInfo.descKey}`)}</span>
          </div>
        )}
        {warnings.map((w, i) => (
          <div key={i} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
            style={{
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.2)',
            }}>
            <span className="text-base">{w.icon}</span>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{t(`parentsGuide.${w.textKey}`)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
