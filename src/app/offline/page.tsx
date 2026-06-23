import Link from 'next/link'
import { IconFilm, IconWifiOff } from '@/components/icons'
import ReloadButton from './ReloadButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Çevrimdışı' }

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-[--bg-card] border border-[--border] flex items-center justify-center mb-6">
        <IconWifiOff className="h-9 w-9 text-[--text-secondary]" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <IconFilm className="h-6 w-6 text-[--accent]" />
        <span className="text-xl font-bold text-white">Sine<span className="text-[--accent]">Ma</span></span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-3">İnternet Bağlantısı Yok</h1>
      <p className="text-[--text-secondary] max-w-sm mb-8 leading-relaxed">
        Bağlantı kurulamadı. Daha önce ziyaret ettiğin sayfalar önbellekten açılabilir.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <ReloadButton />
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full border border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30 font-medium text-sm transition-colors"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  )
}
