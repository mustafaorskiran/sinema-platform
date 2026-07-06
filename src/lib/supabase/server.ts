import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Supabase/Postgres aşırı yüklendiğinde istekler süresiz askıda kalıp
// tüm sayfayı sonsuza kadar "yükleniyor" durumunda bırakabiliyor. Her
// Supabase isteğine sabit bir üst süre koyarak, sorunlu sorgu en geç bu
// sürede hata fırlatsın ve sayfa (error.tsx ile) makul şekilde bozulsun.
const SUPABASE_FETCH_TIMEOUT_MS = 4000

// Bütçe yetmediği için compute yükseltemiyoruz — bunun yerine herkese ortak
// (kullanıcıya özel olmayan) okuma sorgularını kısa süreliğine önbelleğe
// alıyoruz. Aynı film/dizi sayfası dakikada onlarca kez ziyaret edilse bile
// veritabanına sadece ilk istek gider, gerisi Vercel'in cache'inden döner.
// user_id'ye göre filtrelenen (izleme listesi durumu, notlar vb.) veya
// auth uçları asla önbelleğe alınmaz — her zaman taze kalmalı.
const CACHE_REVALIDATE_SECONDS = 60

function timeoutFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS)
  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal

  const method = (init.method ?? 'GET').toUpperCase()
  const url = typeof input === 'string' ? input : input.toString()
  const isPersonalized = url.includes('user_id=') || url.includes('/auth/v1/')

  if (method === 'GET' && !isPersonalized) {
    return fetch(input, { ...init, signal, next: { revalidate: CACHE_REVALIDATE_SECONDS } })
  }
  return fetch(input, { ...init, signal, cache: 'no-store' })
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: timeoutFetch },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
