import type { NextConfig } from "next";
import path from "path";

// Self-hosted Next.js has no eviction for the default filesystem ISR/fetch cache —
// it filled the server disk and took the site down (2026-07-20/21). Route cache
// FETCH-kind entries through Redis instead when configured (see cache-handler.js).
// Uses the REST/fetch client (@upstash/redis), not ioredis — ioredis's Node-only
// TCP APIs get rejected by Turbopack's Edge Runtime build check, since middleware
// always runs on Edge and this file is bundled into edge chunks too.
const hasRedisCache = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const nextConfig: NextConfig = {
  ...(hasRedisCache
    ? {
        cacheHandler: path.join(__dirname, "cache-handler.js"),
        cacheMaxMemorySize: 0,
      }
    : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // /mood ve /ruh-hali aynı özelliğin iki kopyasıydı — tek route'a indirildi.
      { source: '/mood', destination: '/ruh-hali', permanent: true },
      // /gise, /kutu-ofis ile örtüşüyordu (ikisi de gişe sıralaması) — tek route'a indirildi.
      { source: '/gise', destination: '/kutu-ofis', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // AI scraping önleme
          { key: 'X-Robots-Tag', value: 'noai, noimageai' },
          // İçerik kopyalama önleme
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy — kamera/mikrofon erişimi engelle
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://image.tmdb.org https://*.supabase.co https://lh3.googleusercontent.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.themoviedb.org; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; media-src 'self' https://www.youtube.com;",
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          // API rotaları için ek kısıtlamalar
          { key: 'X-Robots-Tag', value: 'noindex, noai' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        // Kullanıcıya özel veri döndürmeyen, tamamen genel içerik uçları —
        // yukarıdaki no-store kuralını burada override ediyoruz (Next.js
        // headers() içinde sıradaki eşleşme kazanır). Diğer tüm API'ler
        // korumalı kalır. Üç ayrı sabit path — path-to-regexp'te OR grubu
        // (filmler|diziler|search) beklenen şekilde eşleşmediği için.
        source: '/api/filmler',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/diziler',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/search',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ]
  },
};

export default nextConfig;
