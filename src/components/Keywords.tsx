import { getTranslations } from '@/lib/i18n'

interface Props {
  keywords: { id: number; name: string }[]
  mediaType: 'film' | 'dizi'
}

export default async function Keywords({ keywords, mediaType }: Props) {
  if (!keywords || keywords.length === 0) return null
  const { t } = await getTranslations()
  const page = mediaType === 'dizi' ? '/diziler' : '/filmler'

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
          {t('film.keywords')}
        </p>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,168,67,0.15) 0%, transparent 100%)' }} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {keywords.slice(0, 24).map(kw => (
          <a
            key={kw.id}
            href={`${page}?keyword=${kw.id}`}
            className="gold-chip px-2.5 py-1 rounded-lg text-[11px]"
          >
            {kw.name}
          </a>
        ))}
      </div>
    </div>
  )
}
