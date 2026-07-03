import Link from 'next/link'
import { IconClapperboard, IconFilm } from '@/components/icons'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl font-black" style={{ color: 'rgba(255,255,255,0.06)' }}>404</div>
      <div className="mb-4"><IconClapperboard size={40} /></div>
      <h1 className="text-2xl font-bold text-white mb-2">Sahne Bulunamadı</h1>
      <p className="text-sm mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Aradığın sayfa ya taşındı ya silinmiş ya da hiç var olmamış. Hayır, bu bir film sahnesi değil.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/"
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 16px rgba(225,29,72,0.25)' }}>
          Ana Sayfaya Dön
        </Link>
        <Link href="/filmler"
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
          <span className="inline-flex items-center gap-1.5"><IconFilm size={16} />Film Keşfet</span>
        </Link>
      </div>
    </div>
  )
}
