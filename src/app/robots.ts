import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/Mustafa/',
          '/api/',
          '/auth/callback',
          '/auth/giris',
          '/auth/kayit',
          '/auth/sifremi-unuttum',
          '/auth/sifre-sifirla',
          '/profil/duzenle',
          '/mesajlar/',
          '/bildirimler',
          '/gunluk',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/Mustafa/', '/api/', '/auth/', '/profil/duzenle', '/mesajlar/', '/bildirimler', '/gunluk'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
