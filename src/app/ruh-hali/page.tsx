import Link from 'next/link'
import { MOODS } from '@/lib/moods'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ruh Haline Göre İzle | Sinezon' }

export default async function RuhHaliPage() {
  const { t } = await getTranslations()
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(212,168,67,0.5)' }}>
          {t('mood.personalized')}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>
          {t('mood.howAreYouFeeling')}
        </h1>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {t('mood.personalizedSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {MOODS.map((mood, i) => (
          <Link
            key={mood.slug}
            href={`/ruh-hali/${mood.slug}`}
            className="group flex flex-col items-center text-center p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
            style={{
              background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <mood.icon size={36} strokeWidth={1.5} className="mb-3 transition-transform duration-300 group-hover:scale-110 block text-[--accent]" />
            <p className="font-bold text-sm leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
              {mood.title}
            </p>
            <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {mood.subtitle}
            </p>
            <div className="mt-3 w-8 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(90deg, #D4A843, #E11D48)' }} />
          </Link>
        ))}
      </div>
    </div>
  )
}
