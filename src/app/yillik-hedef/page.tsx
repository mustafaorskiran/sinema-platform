import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import YearlyChallenge from '@/components/YearlyChallenge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yıllık İzleme Hedefim | Sinezon',
  description: 'Bu yıl kaç film ve dizi izlemek istiyorsun? Hedefini belirle ve takip et.',
}

export default async function YillikHedefPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/giris?next=/yillik-hedef')
  }

  return (
    <div
      className="max-w-2xl mx-auto px-4 sm:px-6 py-12"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Başlık */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          Yıllık İzleme Hedefim
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Bu yıl kaç film izlemek istiyorsun? Hedefini belirle ve takip et.
        </p>
      </div>

      {/* YearlyChallenge widget */}
      <YearlyChallenge />

      {/* Ek bilgi */}
      <div
        className="mt-6 rounded-2xl p-5 text-sm"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Nasıl çalışır?</p>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>Film ve dizi hedefini buradan belirleyebilirsin.</li>
          <li>İzleme listenize "İzledim" olarak eklediğin içerikler otomatik sayılır.</li>
          <li>İlerleme her zaman profilinde görünür.</li>
        </ul>
      </div>
    </div>
  )
}
