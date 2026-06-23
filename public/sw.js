const CACHE_NAME = 'sinema-v3'
const OFFLINE_URL = '/offline'

// ——— Install: sadece offline sayfasını cache'le ———
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  )
})

// ——— Activate: TÜM eski cache'leri sil ———
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ——— Fetch: sadece navigate isteklerde offline fallback ———
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Sadece sayfa navigasyonlarını yakala
  if (request.mode !== 'navigate') return

  const url = new URL(request.url)

  // API ve auth rotalarını pass-through yap
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return

  event.respondWith(
    fetch(request)
      .catch(async () => {
        const cached = await caches.match(OFFLINE_URL)
        return cached ?? new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
      })
  )
})
