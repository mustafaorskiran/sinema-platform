import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tematik Konular' }

export default async function KonularPage() {
  const supabase = await createClient()

  const { data: topics } = await supabase
    .from('topics')
    .select('*, topic_votes(count)')
    .order('id')

  const featured = topics?.find(t => t.is_featured)
  const rest = topics?.filter(t => !t.is_featured) ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tematik Konular</h1>
        <p className="text-[--text-secondary] text-sm mt-1">
          Filmler ve dizilerin işlediği temalar — topluluk oylarıyla şekilleniyor
        </p>
      </div>

      {/* Haftanın Konusu */}
      {featured && (
        <Link
          href={`/konular/${featured.slug}`}
          className="block rounded-2xl bg-gradient-to-r from-[--accent]/20 to-[--bg-card] border border-[--accent]/40 p-6 mb-8 hover:border-[--accent]/70 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[--accent]">Bu Haftanın Konusu</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{featured.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold text-white group-hover:text-[--accent] transition-colors">
                {featured.name}
              </h2>
              <p className="text-[--text-secondary] text-sm mt-1">{featured.description}</p>
              <p className="text-xs text-[--text-secondary] mt-2">
                {(featured.topic_votes as unknown as { count: number }[])?.[0]?.count ?? 0} etiket
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Tüm Konular */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[--text-secondary] mb-4">Tüm Konular</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {rest.map(topic => {
          const count = (topic.topic_votes as unknown as { count: number }[])?.[0]?.count ?? 0
          return (
            <Link
              key={topic.id}
              href={`/konular/${topic.slug}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-[--bg-card] border border-[--border] hover:border-[--accent]/40 transition-colors group"
            >
              <span className="text-2xl shrink-0">{topic.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white group-hover:text-[--accent] transition-colors">{topic.name}</p>
                <p className="text-xs text-[--text-secondary] mt-0.5 line-clamp-1">{topic.description}</p>
              </div>
              <span className="text-xs text-[--text-secondary] shrink-0">{count} etiket</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
