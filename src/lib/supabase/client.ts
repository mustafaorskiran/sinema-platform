import { createBrowserClient } from '@supabase/ssr'

// Sunucu tarafındakiyle aynı sebep: DB aşırı yüklendiğinde istekler
// süresiz askıda kalıp client bileşenlerini sonsuza kadar "yükleniyor"
// durumunda bırakmasın diye üst süre sınırı.
const SUPABASE_FETCH_TIMEOUT_MS = 4000

function timeoutFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS)
  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal
  return fetch(input, { ...init, signal })
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: timeoutFetch } }
  )
}
