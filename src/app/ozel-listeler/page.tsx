import Link from 'next/link'
import { CURATED_LISTS } from '@/lib/curated-lists'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Özel Listeler' }

export default function OzelListelerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Özel Listeler</h1>
        <p className="text-[--text-secondary] text-sm mt-1">
          Editörler tarafından derlenen, mutlaka izlenmesi gereken listeler
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {CURATED_LISTS.map(list => (
          <Link
            key={list.slug}
            href={`/ozel-listeler/${list.slug}`}
            className="flex items-start gap-4 p-5 rounded-2xl bg-[--bg-card] border border-[--border] hover:border-[--accent]/50 transition-colors group"
          >
            <span className="text-4xl shrink-0">{list.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white group-hover:text-[--accent] transition-colors">
                  {list.title}
                </p>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                  list.mediaType === 'film'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-purple-500/15 text-purple-400'
                }`}>
                  {list.mediaType === 'film' ? 'Film' : 'Dizi'}
                </span>
              </div>
              <p className="text-xs text-[--text-secondary] mt-1 line-clamp-2 leading-relaxed">
                {list.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
