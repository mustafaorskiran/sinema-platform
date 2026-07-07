import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sinezon — Film & Dizi Yorumları',
    short_name: 'Sinezon',
    description: 'Filmler ve diziler hakkında yorum yap, puan ver, keşfet.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0B0F19',
    theme_color: '#E11D48',
    categories: ['entertainment', 'social'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Filmler',      short_name: 'Filmler',  url: '/filmler?goruntum=grid', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Diziler',      short_name: 'Diziler',  url: '/diziler?goruntum=grid', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Arama',        short_name: 'Arama',    url: '/arama',                 icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Ne İzlesem?',  short_name: 'Öneri',    url: '/ne-izlesem',            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
    display_override: ['standalone', 'minimal-ui'],
    prefer_related_applications: false,
  }
}
