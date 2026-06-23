interface Props {
  keywords: { id: number; name: string }[]
  mediaType: 'film' | 'dizi'
}

export default function Keywords({ keywords, mediaType }: Props) {
  if (!keywords || keywords.length === 0) return null
  const page = mediaType === 'dizi' ? '/diziler' : '/filmler'

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-wider mb-2">Anahtar Kelimeler</h3>
      <div className="flex flex-wrap gap-1.5">
        {keywords.slice(0, 20).map(kw => (
          <a
            key={kw.id}
            href={`${page}?keyword=${kw.id}`}
            className="px-2.5 py-1 rounded-lg bg-[--bg-card] border border-[--border] text-xs text-[--text-secondary] hover:text-white hover:border-[--accent]/40 transition-colors"
          >
            {kw.name}
          </a>
        ))}
      </div>
    </div>
  )
}
