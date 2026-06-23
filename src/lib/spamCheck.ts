const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+\.[^\s]{2,}/i
const MIN_CHARS = 10
const DUPLICATE_WINDOW_MS = 30_000

// Track last submission per user for duplicate detection
const lastSubmission = new Map<string, { text: string; at: number }>()

export interface SpamResult {
  blocked: boolean
  flagged: boolean  // allow through but send to moderation queue
  error?: string
}

export function checkSpam(userId: string, content: string): SpamResult {
  const trimmed = content.trim()

  if (trimmed.length < MIN_CHARS) {
    return { blocked: true, flagged: false, error: `Yorum en az ${MIN_CHARS} karakter olmalı.` }
  }

  // Repeated identical content within 30s
  const last = lastSubmission.get(userId)
  const now = Date.now()
  if (last && now - last.at < DUPLICATE_WINDOW_MS && last.text === trimmed) {
    return { blocked: true, flagged: false, error: 'Aynı yorumu tekrar gönderiyorsun.' }
  }

  // All-caps detection (at least 30 chars, >70% uppercase letters = spam)
  const letters = trimmed.replace(/[^a-zA-ZığüşöçİĞÜŞÖÇ]/g, '')
  if (letters.length > 30 && letters.split('').filter(c => c === c.toUpperCase()).length / letters.length > 0.7) {
    return { blocked: true, flagged: false, error: 'Büyük harf kullanımı çok fazla.' }
  }

  lastSubmission.set(userId, { text: trimmed, at: now })

  // URL → flag for moderation but don't block
  if (URL_PATTERN.test(trimmed)) {
    return { blocked: false, flagged: true, error: undefined }
  }

  return { blocked: false, flagged: false }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, val] of lastSubmission) {
    if (now - val.at > DUPLICATE_WINDOW_MS) lastSubmission.delete(key)
  }
}, 60_000)
