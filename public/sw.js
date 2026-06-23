const CACHE_NAME = 'sinema-v1'
const STATIC_CACHE = 'sinema-static-v1'
const IMAGE_CACHE = 'sinema-images-v1'

const IMAGE_CACHE_LIMIT = 150

// Uygulama kabuğu — bunlar her zaman önbellekte olsun
const APP_SHELL = ['/', '/filmler', '/diziler', '/offline']

// ——— Install ———
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  )
})

// ——— Activate ———
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== STATIC_CACHE && k !== IMAGE_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ——— Fetch ———
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API isteklerini ve auth'u asla önbellekleme
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    return
  }

  // TMDb görselleri — cache first, limit 150
  if (url.hostname === 'image.tmdb.org') {
    event.respondWith(cacheFirstWithLimit(request, IMAGE_CACHE, IMAGE_CACHE_LIMIT))
    return
  }

  // Next.js static dosyaları (_next/static) — cache first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // HTML sayfaları — network first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }
})

// ——— Stratejiler ———

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function cacheFirstWithLimit(request, cacheName, limit) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      if (keys.length >= limit) await cache.delete(keys[0])
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 503 })
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return caches.match('/offline')
  }
}
