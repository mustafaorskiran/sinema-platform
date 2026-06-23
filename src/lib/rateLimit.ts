// In-memory rate limiter — resets on cold start (acceptable for spam prevention at this scale)

type Window = { count: number; resetAt: number }
const store = new Map<string, Window>()

export function rateLimit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now()
  const win = store.get(key)

  if (!win || now >= win.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (win.count >= max) return false
  win.count++
  return true
}

// Clean up expired windows every minute to prevent memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, win] of store) {
    if (now >= win.resetAt) store.delete(key)
  }
}, 60_000)
