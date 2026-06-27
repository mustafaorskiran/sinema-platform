const CACHE_NAME = 'sinema-v4'
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

// ——— Push: bildirim göster ———
self.addEventListener('push', (event) => {
  if (!event.data) return
  const { title, body, url } = event.data.json()
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url },
      vibrate: [100, 50, 100],
    })
  )
})

// ——— Notification click: ilgili URL'ye git ———
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(url))
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
