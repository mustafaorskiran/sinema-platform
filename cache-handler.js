// Next.js fetch/ISR cache backed by Upstash Redis over its REST API (fetch-based,
// Edge-Runtime-safe — no Node-only TCP/socket APIs, since middleware always runs on
// Edge even self-hosted, and next.config.ts's cacheHandler is bundled into edge
// chunks too).
//
// Two prior attempts, both rolled back same day (2026-07-21):
//   1. This same REST client, but serializing EVERY cache kind with a naive
//      JSON.stringify(data). Next's CacheHandler protocol (see
//      next/dist/server/response-cache/types.d.ts) passes non-JSON-safe payloads for
//      non-FETCH kinds — APP_PAGE/PAGES carry `rscData`/`segmentData` as Buffer/Map,
//      APP_ROUTE and IMAGE carry raw Buffer bodies. JSON.stringify silently mangles
//      these (Map -> {}, Buffer -> {type:'Buffer',data:[...]}), and Next crashed
//      trying to use the corrupted value back:
//      "TypeError: controller[kState].transformAlgorithm is not a function"
//   2. ioredis (TCP) — references Node-only APIs (net/tls via the package, plus our
//      own process.versions guard), which Turbopack's Edge Runtime static check
//      rejects at *build* time — even for code paths that would never run on Edge.
//
// Fix: only cache `kind: 'FETCH'` entries — Next's on-disk `.next/cache/fetch-cache/`
// dir, exactly what filled the server disk in the original incident (TMDb API
// responses via fetch(..., { next: { revalidate } })). Its `data.body` is already a
// plain string, so nothing here ever needs Buffer/Map, and no Node-only API is
// referenced — safe for the Edge bundle. Every other cache kind (page/route/image)
// simply isn't cached through Redis; Next treats it as a permanent miss for those,
// which is fine since they weren't what filled the disk.

const PREFIX = 'nextjs-cache:'
const MAX_TTL_SECONDS = 60 * 60 * 24 // 24h hard cap regardless of requested revalidate

let redis = null
function getClient() {
  if (!redis) {
    const { Redis } = require('@upstash/redis')
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

module.exports = class CacheHandler {
  constructor(ctx) {
    this.ctx = ctx
  }

  async get(key) {
    try {
      const entry = await getClient().get(PREFIX + key)
      if (!entry || !entry.value || entry.value.kind !== 'FETCH') return null
      return entry
    } catch {
      return null
    }
  }

  async set(key, data, ctx) {
    if (!data || data.kind !== 'FETCH') return // only FETCH entries are JSON-safe
    try {
      const ttl = ctx && typeof ctx.revalidate === 'number'
        ? Math.min(Math.max(60, ctx.revalidate), MAX_TTL_SECONDS)
        : MAX_TTL_SECONDS
      await getClient().set(
        PREFIX + key,
        { lastModified: Date.now(), value: data },
        { ex: ttl }
      )
    } catch {
      // Best-effort cache — a Redis hiccup must never break the request.
    }
  }

  async revalidateTag() {
    // No-op: app doesn't call revalidateTag/revalidatePath, entries expire via TTL.
  }
}
