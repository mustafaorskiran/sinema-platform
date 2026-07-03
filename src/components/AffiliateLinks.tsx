'use client'

import { useLocale } from '@/context/LocaleContext'
import { IconShoppingCart, IconFilm, IconTicket } from '@/components/icons'

interface Props {
  title: string
  year?: string | number
}

export default function AffiliateLinks({ title, year }: Props) {
  const { t } = useLocale()
  const q = encodeURIComponent(`${title}${year ? ` ${year}` : ''}`)
  const links = [
    {
      label: 'Amazon',
      icon: IconShoppingCart,
      href: `https://www.amazon.com.tr/s?k=${q}`,
      title: t('affiliateLinks.searchOnAmazon'),
    },
    {
      label: 'MUBI',
      icon: IconFilm,
      href: `https://mubi.com/tr/search?query=${q}`,
      title: t('affiliateLinks.searchOnMubi'),
    },
    {
      label: 'Biletix',
      icon: IconTicket,
      href: `https://www.biletix.com/arama?searchTerm=${q}`,
      title: t('affiliateLinks.searchOnBiletix'),
    },
  ]

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {links.map(link => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.title}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full rounded-xl text-[--text-secondary] hover:text-white hover:border-[--accent]/40 transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <link.icon size={14} />
          {link.label}
        </a>
      ))}
    </div>
  )
}
