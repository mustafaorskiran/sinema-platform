'use client'

import { IconClapperboard, IconFilm } from '@/components/icons'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-4"><IconClapperboard size={40} /></div>
      <h1 className="text-2xl font-bold text-white mb-2">Bir Şeyler Ters Gitti</h1>
      <p className="text-sm mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Sayfa şu anda yüklenemedi. Sunucularımız yoğun olabilir, lütfen tekrar deneyin.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={() => reset()}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 16px rgba(225,29,72,0.25)' }}>
          Tekrar Dene
        </button>
        <a href="/"
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
          <span className="inline-flex items-center gap-1.5"><IconFilm size={16} />Ana Sayfaya Dön</span>
        </a>
      </div>
    </div>
  )
}
