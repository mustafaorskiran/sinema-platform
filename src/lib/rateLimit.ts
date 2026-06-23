// Redis-backed rate limiter (Upstash). Falls back to in-memory when env vars are absent (local dev).
// Requires: npm install @upstash/ratelimit @upstash/redis
// Requires env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const hasRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

// ─── In-memory fallback (local dev only — resets on cold start) ───────────────
type Window = { count: number; resetAt: number }
const memStore = new Map<string, Window>()
setInterval(() => {
  const now = Date.now()
  for (const [k, w] of memStore) { if (now >= w.resetAt) memStore.delete(k) }
}, 60_000)

function memLimit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now()
  const win = memStore.get(key)
  if (!win || now >= win.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (win.count >= max) return false
  win.count++
  return true
}

// ─── Redis-backed (production) ────────────────────────────────────────────────
let redis: Redis | null = null
const limiters = new Map<string, Ratelimit>()

function getLimiter(windowMs: number, max: number): Ratelimit {
  const cacheKey = `${windowMs}:${max}`
  if (limiters.has(cacheKey)) return limiters.get(cacheKey)!

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }

  const seconds = Math.max(1, Math.ceil(windowMs / 1000))
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${seconds} s`),
    prefix: '@sinezon/rl',
  })
  limiters.set(cacheKey, limiter)
  return limiter
}

// Returns true = allowed, false = rate limited
export async function rateLimit(key: string, windowMs: number, max: number): Promise<boolean> {
  if (!hasRedis) return memLimit(key, windowMs, max)
  try {
    const { success } = await getLimiter(windowMs, max).limit(key)
    return success
  } catch {
    // Redis unavailable — fail open (allow) and fall back to in-memory
    return memLimit(key, windowMs, max)
  }
}
