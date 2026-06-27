import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ImportClient from './ImportClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Letterboxd İçe Aktar | Sinezon',
  description: 'Letterboxd izleme listenizi Sinezon\'a aktarın.',
}

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris?next=/import')

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-5"
          style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)' }}>
          <span className="text-2xl">📥</span>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Letterboxd İçe Aktar
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Letterboxd CSV dosyanı yükleyerek izleme listeni Sinezon&apos;a aktar
        </p>
      </div>

      <div className="rounded-2xl p-6 mb-6"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.1)' }}>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'rgba(212,168,67,0.5)' }}>
          Nasıl yapılır?
        </p>
        <ol className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <li className="flex gap-2.5">
            <span className="font-bold shrink-0" style={{ color: 'rgba(212,168,67,0.7)' }}>1.</span>
            <span>Letterboxd&apos;a giriş yap → <strong style={{ color: 'var(--text-primary)' }}>Ayarlar → İmport & Ekport → Dışa Aktar</strong></span>
          </li>
          <li className="flex gap-2.5">
            <span className="font-bold shrink-0" style={{ color: 'rgba(212,168,67,0.7)' }}>2.</span>
            <span>İndirilen ZIP dosyasından <strong style={{ color: 'var(--text-primary)' }}>watched.csv</strong> dosyasını çıkar</span>
          </li>
          <li className="flex gap-2.5">
            <span className="font-bold shrink-0" style={{ color: 'rgba(212,168,67,0.7)' }}>3.</span>
            <span>Aşağıdan dosyayı yükle — filmler izleme listene otomatik eklenir</span>
          </li>
        </ol>
      </div>

      <ImportClient />
    </div>
  )
}
