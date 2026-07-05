import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import Logo from '@/components/Logo'
import {
  IconFilm, IconStarFilled, IconPencil, IconClipboard, IconCalendar, IconUsers,
  IconTrophy, IconRobot, IconFire, IconTv, IconMasks, IconNewspaper, IconGift,
} from '@/components/icons'

export const metadata: Metadata = {
  title: 'Sinezon Hakkında | Sinezon',
  description: 'Sinezon nedir? Türkiye\'nin film ve dizi topluluk platformu hakkında her şey.',
}

export default async function HakkindaPage() {
  const { t } = await getTranslations()

  const FEATURES = [
    { icon: IconFilm, title: t('legal.featureCatalogTitle'), desc: t('legal.featureCatalogDesc') },
    { icon: IconStarFilled, title: t('legal.featureRatingTitle'), desc: t('legal.featureRatingDesc') },
    { icon: IconPencil, title: t('legal.featureReviewsTitle'), desc: t('legal.featureReviewsDesc') },
    { icon: IconClipboard, title: t('legal.featureListsTitle'), desc: t('legal.featureListsDesc') },
    { icon: IconCalendar, title: t('legal.featureDiaryTitle'), desc: t('legal.featureDiaryDesc') },
    { icon: IconUsers, title: t('legal.featureSocialTitle'), desc: t('legal.featureSocialDesc') },
    { icon: IconTrophy, title: t('legal.featureBadgesTitle'), desc: t('legal.featureBadgesDesc') },
    { icon: IconRobot, title: t('legal.featureAiTitle'), desc: t('legal.featureAiDesc') },
    { icon: IconFire, title: t('legal.featureTrendsTitle'), desc: t('legal.featureTrendsDesc') },
    { icon: IconTv, title: t('legal.featureSeriesTitle'), desc: t('legal.featureSeriesDesc') },
    { icon: IconMasks, title: t('legal.featureUniverseTitle'), desc: t('legal.featureUniverseDesc') },
    { icon: IconNewspaper, title: t('legal.featureNewsTitle'), desc: t('legal.featureNewsDesc') },
  ]

  const FAQ = [
    { q: t('legal.faqFreeQ'), a: t('legal.faqFreeA') },
    { q: t('legal.faqLangQ'), a: t('legal.faqLangA') },
    { q: t('legal.faqCommentsQ'), a: t('legal.faqCommentsA') },
    { q: t('legal.faqSecurityQ'), a: t('legal.faqSecurityA') },
    { q: t('legal.faqContentQ'), a: t('legal.faqContentA') },
  ]

  const STATS = [
    { v: '10.000+', l: t('legal.statFilmSeries') },
    { v: '∞', l: t('legal.statReviews') },
    { v: '100%', l: t('legal.statTurkish') },
    { v: t('legal.statFreeValue'), l: t('legal.statBasicPlan') },
  ]

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex justify-center mb-6">
          <Logo variant="full" size="md" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">
          {t('legal.heroTitle')}
        </h1>
        <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {t('legal.heroDesc')}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link href="/auth/kayit"
            className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 16px rgba(225,29,72,0.3)' }}>
            {t('legal.joinFree')}
          </Link>
          <Link href="/filmler"
            className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
            {t('legal.exploreFilms')}
          </Link>
        </div>
      </div>

      {/* Özellikler */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-white mb-6 text-center">{t('legal.featuresTitle')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="p-4 rounded-xl" style={card}>
              <div className="mb-2 text-[--accent]"><f.icon size={24} /></div>
              <p className="font-semibold text-white text-sm mb-1">{f.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* İstatistikler */}
      <section className="mb-14">
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(160deg, rgba(225,29,72,0.06), rgba(14,20,32,0.95))', border: '1px solid rgba(225,29,72,0.15)' }}>
          <h2 className="text-xl font-bold text-white mb-6">{t('legal.communityGrowingTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.l}>
                <p className="text-2xl font-black text-white">{s.v}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-white mb-6">{t('legal.faqTitle')}</h2>
        <div className="space-y-3">
          {FAQ.map(item => (
            <div key={item.q} className="p-5 rounded-xl" style={card}>
              <p className="font-semibold text-white text-sm mb-1.5">{item.q}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destek */}
      <section className="text-center">
        <div className="rounded-2xl p-6 mb-4" style={{ background: 'linear-gradient(160deg, rgba(212,168,67,0.08), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.2)' }}>
          <p className="text-lg font-bold text-white mb-1 inline-flex items-center gap-2"><IconGift size={20} /> {t('legal.supportTitle')}</p>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {t('legal.supportDesc')}
          </p>
          <a
            href="https://ko-fi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843' }}
          >
            <IconGift size={16} /> {t('legal.supportKofi')}
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))', border: '1px solid rgba(212,168,67,0.12)' }}>
          <p className="text-2xl font-black text-white mb-2">{t('legal.ctaTitle')}</p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('legal.ctaDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/kayit"
              className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 16px rgba(225,29,72,0.25)' }}>
              {t('legal.ctaRegister')}
            </Link>
            <Link href="/gizlilik"
              className="px-6 py-3 rounded-xl text-sm font-medium transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              {t('legal.privacyLink')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
