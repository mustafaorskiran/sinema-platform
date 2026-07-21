// Next.js ISR/fetch cache backed by Redis over a raw TCP connection (ioredis).
//
// First attempt used the REST/fetch-based @upstash/redis client, which makes its own
// fetch() calls — these collided with Next's internal fetch-patching (used to intercept
// and cache fetch() calls) and crashed page renders in production:
//   TypeError: controller[kState].transformAlgorithm is not a function
// (incident 2026-07-21, rolled back same day). ioredis talks over a plain TCP/TLS
// socket and never touches fetch, sidestepping that class of conflict entirely.
//
// Self-hosted Next.js has no eviction for the default filesystem cache — it filled
// the server disk to 100% and took the site down (2026-07-20/21). Only wired up in
// next.config.ts when REDIS_URL is present; otherwise Next falls back to its default
// filesystem cache handler.
const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
})
// Caching is best-effort — a connection error must never crash the process.
redis.on('error', () => {})

const PREFIX = 'nextjs-cache:'
const MAX_TTL_SECONDS = 60 * 60 * 24 // 24h hard cap regardless of requested revalidate

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options
  }

  async get(key) {
    try {
      const data = await redis.get(PREFIX + key)
      if (!data) return null
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async set(key, data, ctx) {
    try {
      const ttl = ctx && typeof ctx.revalidate === 'number'
        ? Math.min(Math.max(60, ctx.revalidate), MAX_TTL_SECONDS)
        : MAX_TTL_SECONDS
      await redis.set(
        PREFIX + key,
        JSON.stringify({ value: data, lastModified: Date.now() }),
        'EX',
        ttl
      )
    } catch {
      // Best-effort cache — a Redis hiccup must never break the request.
    }
  }

  async revalidateTag() {
    // No-op: app doesn't call revalidateTag/revalidatePath, entries expire via TTL.
  }
}
