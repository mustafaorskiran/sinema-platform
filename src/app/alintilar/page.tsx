import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Film & Dizi Alıntıları | Sinezon',
  description: 'Filmlerin ve dizilerin en etkileyici alıntıları Sinezon\'da.',
}

interface Quote {
  id: string
  content: string
  character_name: string | null
  media_id: number
  media_type: 'film' | 'dizi'
  created_at: string
  profiles: { username: string } | null
}

export default async function AlintilarPage() {
  const supabase = await createClient()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, content, character_name, media_id, media_type, profiles(username), created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(50)

  const allQuotes = (quotes ?? []) as unknown as Quote[]

  // "Bugünün Alıntısı": en son alıntı
  const heroQuote = allQuotes[0] ?? null
  // Geri kalanlar (hero hariç)
  const restQuotes = allQuotes.slice(1)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Başlık */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Film &amp; Dizi Alıntıları</h1>
        <p className="text-[--text-secondary] text-sm mt-1">
          Sinezon topluluğunun en sevdiği sahne diyalogları ve unutulmaz sözler
        </p>
      </div>

      {/* Bugünün Alıntısı */}
      {heroQuote ? (
        <div
          className="mb-10 rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))',
            border: '1px solid rgba(212,168,67,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,168,67,0.05)',
          }}
        >
          <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] mb-5" style={{ color: 'rgba(212,168,67,0.6)' }}>
            ✦ Öne Çıkan Alıntı
          </p>
          <span
            className="absolute top-2 right-5 text-[9rem] font-serif leading-none select-none pointer-events-none"
            style={{ color: '#D4A843', opacity: 0.06 }}
            aria-hidden
          >
            "
          </span>
          <p className="text-2xl sm:text-3xl font-semibold leading-snug mb-4" style={{ color: 'var(--text-primary)' }}>
            "{heroQuote.content}"
          </p>
          {heroQuote.character_name && (
            <p className="italic text-[--text-secondary] text-base mb-3">
              — {heroQuote.character_name}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <Link
              href={`/${heroQuote.media_type === 'film' ? 'film' : 'dizi'}/${heroQuote.media_id}`}
              className="text-sm text-[--accent] hover:underline font-medium"
            >
              {heroQuote.media_type === 'film' ? '🎬 Filme Git →' : '📺 Diziye Git →'}
            </Link>
            {heroQuote.profiles?.username && (
              <span className="text-xs text-[--text-secondary]">
                paylaşan:{' '}
                <Link
                  href={`/profil/${heroQuote.profiles.username}`}
                  className="hover:text-white transition-colors"
                >
                  @{heroQuote.profiles.username}
                </Link>
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-2xl bg-[--bg-card] border border-[--border] p-10 text-center text-[--text-secondary]">
          Henüz alıntı eklenmemiş.
        </div>
      )}

      {/* Masonry Grid */}
      {restQuotes.length > 0 && (
        <div className="columns-1 md:columns-2 gap-4 space-y-4">
          {restQuotes.map((quote) => (
            <div
              key={quote.id}
              className="break-inside-avoid rounded-2xl p-6 mb-4 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Büyük tırnak işareti */}
              <span
                className="absolute top-3 right-4 text-6xl font-serif leading-none select-none pointer-events-none"
                style={{ color: 'var(--accent)', opacity: 0.10 }}
                aria-hidden
              >
                "
              </span>

              <p className="text-lg font-medium text-white leading-snug mb-3 pr-4">
                "{quote.content}"
              </p>

              {quote.character_name && (
                <p className="italic text-[--text-secondary] text-sm mb-3">
                  — {quote.character_name}
                </p>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Link
                  href={`/${quote.media_type === 'film' ? 'film' : 'dizi'}/${quote.media_id}`}
                  className="text-xs text-[--accent] hover:underline font-medium"
                >
                  {quote.media_type === 'film' ? '🎬 Film' : '📺 Dizi'} →
                </Link>
                {quote.profiles?.username && (
                  <Link
                    href={`/profil/${quote.profiles.username}`}
                    className="text-xs text-[--text-secondary] hover:text-white transition-colors"
                  >
                    @{quote.profiles.username}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {allQuotes.length === 0 && (
        <div className="rounded-2xl bg-[--bg-card] border border-[--border] p-16 text-center text-[--text-secondary]">
          Henüz alıntı eklenmemiş.
        </div>
      )}
    </div>
  )
}
