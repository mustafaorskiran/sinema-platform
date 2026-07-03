import Link from 'next/link'
import { CURATED_LISTS } from '@/lib/curated-lists'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconFilm, IconTv } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Özel Listeler | Sinezon',
  description: 'Editörler tarafından derlenen, mutlaka izlenmesi gereken seçki listeler.'
}

export default async function OzelListelerPage() {
  const { t } = await getTranslations()
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.25)', color: 'var(--accent)' }}>
          ✦ {t('specialLists.badge')}
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('specialLists.title')}</h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {t('specialLists.subtitle')}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CURATED_LISTS.map((list, i) => (
          <Link
            key={list.slug}
            href={`/ozel-listeler/${list.slug}`}
            className="group flex flex-col gap-3 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
            style={{
              background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center justify-between">
              <list.icon size={32} strokeWidth={1.5} className="text-[--accent] transition-transform duration-300 group-hover:scale-110 block" />
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                list.mediaType === 'film'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
              }`}>
                {list.mediaType === 'film' ? <IconFilm size={12} /> : <IconTv size={12} />}
                {list.mediaType === 'film' ? t('film.badge') : t('series.badge')}
              </span>
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-[--accent] transition-colors text-[15px] mb-1.5">
                {list.title}
              </p>
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {list.description}
              </p>
            </div>
            <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('specialLists.pickNumber', { number: i + 1 })}
              </span>
              <span className="text-[11px] font-semibold group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--accent)' }}>
                {t('specialLists.explore')} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
