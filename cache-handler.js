// Next.js ISR/fetch cache backed by Redis over a raw TCP connection (ioredis).
//
// Two prior attempts, both rolled back same day (2026-07-21):
//   1. REST/fetch-based @upstash/redis — its own fetch() calls collided with Next's
//      internal fetch-patching and crashed page renders:
//      "TypeError: controller[kState].transformAlgorithm is not a function"
//   2. ioredis, required eagerly at module top-level — Next bundles this file into
//      Edge Runtime chunks too (proxy/middleware always runs on Edge, even self-hosted,
//      and next.config.ts's cacheHandler is applied globally). ioredis touches Node
//      built-ins (net/tls/process internals) that don't exist in the Edge sandbox,
//      which crashed at module-evaluation time — before any request-level code ran:
//      "TypeError: Cannot read properties of undefined (reading 'charCodeAt')"
//
// Fix: defer `require('ioredis')` and client construction until get()/set() actually
// run, and bail out immediately if not on the Node.js runtime. Edge bundles still
// contain this file (Next needs it there statically), but as long as nothing inside
// it executes at module-evaluation time, the Edge sandbox never touches ioredis.
//
// Self-hosted Next.js has no eviction for the default filesystem cache — it filled
// the server disk to 100% and took the site down (2026-07-20/21). Only wired up in
// next.config.ts when REDIS_URL is present; otherwise Next falls back to its default
// filesystem cache handler.

const PREFIX = 'nextjs-cache:'
const MAX_TTL_SECONDS = 60 * 60 * 24 // 24h hard cap regardless of requested revalidate

// True only in a real Node.js process — false in the Edge/V8-isolate sandbox.
const isNodeRuntime = typeof process !== 'undefined' && !!process.versions?.node

let client = null
function getClient() {
  if (!isNodeRuntime) return null
  if (!client) {
    const Redis = require('ioredis')
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    })
    // Caching is best-effort — a connection error must never crash the process.
    client.on('error', () => {})
  }
  return client
}

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options
  }

  async get(key) {
    const redis = getClient()
    if (!redis) return null
    try {
      const data = await redis.get(PREFIX + key)
      if (!data) return null
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async set(key, data, ctx) {
    const redis = getClient()
    if (!redis) return
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
