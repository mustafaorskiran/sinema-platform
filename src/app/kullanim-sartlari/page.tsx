import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Kullanım Şartları | Sinezon',
  description: 'Sinezon kullanım şartları ve koşulları — platforma kayıt olarak kabul ettiğiniz kurallar.',
}

export default async function KullanimSartlariPage() {
  const { t } = await getTranslations()

  const sections = [
    {
      title: t('terms.scope.title'),
      content: [
        { subtitle: '', text: t('terms.scope.text') },
      ],
    },
    {
      title: t('terms.account.title'),
      content: [
        { subtitle: t('terms.account.regTitle'), text: t('terms.account.regText') },
        { subtitle: t('terms.account.securityTitle'), text: t('terms.account.securityText') },
        { subtitle: t('terms.account.usernameTitle'), text: t('terms.account.usernameText') },
      ],
    },
    {
      title: t('terms.content.title'),
      content: [
        { subtitle: t('terms.content.allowedTitle'), text: t('terms.content.allowedText') },
        { subtitle: t('terms.content.forbiddenTitle'), text: t('terms.content.forbiddenText') },
        { subtitle: t('terms.content.spoilerTitle'), text: t('terms.content.spoilerText') },
        { subtitle: t('terms.content.copyrightTitle'), text: t('terms.content.copyrightText') },
      ],
    },
    {
      title: t('terms.usage.title'),
      content: [
        { subtitle: t('terms.usage.fairTitle'), text: t('terms.usage.fairText') },
        { subtitle: t('terms.usage.fakeTitle'), text: t('terms.usage.fakeText') },
        { subtitle: t('terms.usage.commercialTitle'), text: t('terms.usage.commercialText') },
      ],
    },
    {
      title: t('terms.ip.title'),
      content: [
        { subtitle: t('terms.ip.ownershipTitle'), text: t('terms.ip.ownershipText') },
        { subtitle: t('terms.ip.userContentTitle'), text: t('terms.ip.userContentText') },
      ],
    },
    {
      title: t('terms.moderation.title'),
      content: [
        { subtitle: t('terms.moderation.contentTitle'), text: t('terms.moderation.contentText') },
        { subtitle: t('terms.moderation.sanctionsTitle'), text: t('terms.moderation.sanctionsText') },
        { subtitle: t('terms.moderation.reportTitle'), text: t('terms.moderation.reportText') },
      ],
    },
    {
      title: t('terms.changes.title'),
      content: [
        { subtitle: '', text: t('terms.changes.text') },
      ],
    },
    {
      title: t('terms.disclaimer.title'),
      content: [
        { subtitle: t('terms.disclaimer.userContentTitle'), text: t('terms.disclaimer.userContentText') },
        { subtitle: t('terms.disclaimer.thirdPartyTitle'), text: t('terms.disclaimer.thirdPartyText') },
      ],
    },
    {
      title: t('terms.law.title'),
      content: [
        { subtitle: '', text: t('terms.law.text') },
      ],
    },
    {
      title: t('terms.updates.title'),
      content: [
        { subtitle: '', text: t('terms.updates.text') },
      ],
    },
    {
      title: t('terms.contact.title'),
      content: [
        { subtitle: '', text: t('terms.contact.text') },
      ],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Başlık */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #E11D48 0%, #be123c 100%)' }} />
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{t('terms.pageTitle')}</h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('terms.lastUpdated')}
        </p>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {t('terms.intro')}
        </p>
      </div>

      {/* Bölümler */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h2 className="text-base font-bold text-white mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.content.map((item, i) => (
                <div key={i}>
                  {item.subtitle && (
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#E11D48' }}>
                      {item.subtitle}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Alt bağlantılar */}
      <div className="mt-10 pt-6 flex flex-wrap gap-4 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/gizlilik" className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('terms.privacyLink')}
        </a>
        <a href="/hakkimizda" className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('terms.aboutLink')}
        </a>
      </div>
    </div>
  )
}
