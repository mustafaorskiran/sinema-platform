// Next.js ISR/fetch cache backed by Upstash Redis.
// Self-hosted Next.js has no eviction for the default filesystem cache — it filled
// the server disk to 100% and took the site down (2026-07-20/21 incident). Every
// entry gets a hard-capped TTL so Redis usage stays bounded even if a fetch call
// omits `revalidate`. Only wired up in next.config.ts when Upstash env vars exist.
const { Redis } = require('@upstash/redis')

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const PREFIX = 'nextjs-cache:'
const MAX_TTL_SECONDS = 60 * 60 * 24 // 24h hard cap regardless of requested revalidate

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options
  }

  async get(key) {
    try {
      return (await redis.get(PREFIX + key)) ?? null
    } catch {
      return null
    }
  }

  async set(key, data, ctx) {
    try {
      const ttl = ctx && typeof ctx.revalidate === 'number'
        ? Math.min(Math.max(60, ctx.revalidate), MAX_TTL_SECONDS)
        : MAX_TTL_SECONDS
      await redis.set(PREFIX + key, { value: data, lastModified: Date.now() }, { ex: ttl })
    } catch {
      // Best-effort cache — a Redis hiccup must never break the request.
    }
  }

  async revalidateTag() {
    // No-op: app doesn't call revalidateTag/revalidatePath, entries expire via TTL.
  }
}
