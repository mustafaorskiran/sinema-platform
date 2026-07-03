import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import YearlyChallenge from '@/components/YearlyChallenge'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconTrophy } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Yıllık İzleme Hedefim | Sinezon',
  description: 'Bu yıl kaç film ve dizi izlemek istiyorsun? Hedefini belirle ve takip et.',
}

export default async function YillikHedefPage() {
  const { t } = await getTranslations()
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
        <div className="flex justify-center mb-4"><IconTrophy size={48} className="text-[--gold]" /></div>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {t('yearlyGoal.title')}
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {t('yearlyGoal.subtitle')}
        </p>
      </div>

      {/* YearlyChallenge widget */}
      <YearlyChallenge />

      {/* Ek bilgi */}
      <div
        className="mt-6 rounded-2xl p-5 text-sm"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('yearlyGoal.howItWorksTitle')}</p>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>{t('yearlyGoal.howItWorks1')}</li>
          <li>{t('yearlyGoal.howItWorks2')}</li>
          <li>{t('yearlyGoal.howItWorks3')}</li>
        </ul>
      </div>
    </div>
  )
}
