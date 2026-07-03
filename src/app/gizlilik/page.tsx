import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Sinezon',
  description: 'Sinezon gizlilik politikası — kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında bilgi.',
}

const sections = [
  {
    titleKey: 'legal.privacy.s1.title',
    content: [
      { subtitleKey: 'legal.privacy.s1.c1.subtitle', textKey: 'legal.privacy.s1.c1.text' },
      { subtitleKey: 'legal.privacy.s1.c2.subtitle', textKey: 'legal.privacy.s1.c2.text' },
      { subtitleKey: 'legal.privacy.s1.c3.subtitle', textKey: 'legal.privacy.s1.c3.text' },
    ],
  },
  {
    titleKey: 'legal.privacy.s2.title',
    content: [
      { subtitleKey: 'legal.privacy.s2.c1.subtitle', textKey: 'legal.privacy.s2.c1.text' },
      { subtitleKey: 'legal.privacy.s2.c2.subtitle', textKey: 'legal.privacy.s2.c2.text' },
      { subtitleKey: 'legal.privacy.s2.c3.subtitle', textKey: 'legal.privacy.s2.c3.text' },
    ],
  },
  {
    titleKey: 'legal.privacy.s3.title',
    content: [
      { subtitleKey: 'legal.privacy.s3.c1.subtitle', textKey: 'legal.privacy.s3.c1.text' },
      { subtitleKey: 'legal.privacy.s3.c2.subtitle', textKey: 'legal.privacy.s3.c2.text' },
    ],
  },
  {
    titleKey: 'legal.privacy.s4.title',
    content: [
      { subtitleKey: 'legal.privacy.s4.c1.subtitle', textKey: 'legal.privacy.s4.c1.text' },
      { subtitleKey: 'legal.privacy.s4.c2.subtitle', textKey: 'legal.privacy.s4.c2.text' },
      { subtitleKey: 'legal.privacy.s4.c3.subtitle', textKey: 'legal.privacy.s4.c3.text' },
    ],
  },
  {
    titleKey: 'legal.privacy.s5.title',
    content: [
      { subtitleKey: 'legal.privacy.s5.c1.subtitle', textKey: 'legal.privacy.s5.c1.text' },
      { subtitleKey: 'legal.privacy.s5.c2.subtitle', textKey: 'legal.privacy.s5.c2.text' },
      { subtitleKey: 'legal.privacy.s5.c3.subtitle', textKey: 'legal.privacy.s5.c3.text' },
    ],
  },
  {
    titleKey: 'legal.privacy.s6.title',
    content: [
      { subtitleKey: 'legal.privacy.s6.c1.subtitle', textKey: 'legal.privacy.s6.c1.text' },
      { subtitleKey: 'legal.privacy.s6.c2.subtitle', textKey: 'legal.privacy.s6.c2.text' },
    ],
  },
  {
    titleKey: 'legal.privacy.s7.title',
    content: [
      { subtitleKey: '', textKey: 'legal.privacy.s7.c1.text' },
    ],
  },
  {
    titleKey: 'legal.privacy.s8.title',
    content: [
      { subtitleKey: '', textKey: 'legal.privacy.s8.c1.text' },
    ],
  },
  {
    titleKey: 'legal.privacy.s9.title',
    content: [
      { subtitleKey: '', textKey: 'legal.privacy.s9.c1.text' },
    ],
  },
]

export default async function GizlilikPage() {
  const { t } = await getTranslations()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Başlık */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #E11D48 0%, #be123c 100%)' }} />
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{t('legal.privacy.pageTitle')}</h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('legal.privacy.lastUpdated')}
        </p>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {t('legal.privacy.intro')}
        </p>
      </div>

      {/* Bölümler */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.titleKey}
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h2 className="text-base font-bold text-white mb-4">{t(section.titleKey)}</h2>
            <div className="space-y-4">
              {section.content.map((item, i) => (
                <div key={i}>
                  {item.subtitleKey && (
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#E11D48' }}>
                      {t(item.subtitleKey)}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {t(item.textKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Alt bağlantılar */}
      <div className="mt-10 pt-6 flex flex-wrap gap-4 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/kullanim-sartlari" className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('legal.privacy.termsLink')}
        </a>
        <a href="/hakkimizda" className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('legal.privacy.aboutLink')}
        </a>
      </div>
    </div>
  )
}
