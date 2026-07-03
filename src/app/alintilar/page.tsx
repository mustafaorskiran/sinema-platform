import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import UserHoverCard from '@/components/UserHoverCard'
import QuoteLikeButton from '@/components/QuoteLikeButton'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

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
  likes_count: number
  profiles: { username: string } | null
}

export default async function AlintilarPage() {
  const { t } = await getTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, content, character_name, media_id, media_type, likes_count, profiles(username), created_at')
    .eq('approved', true)
    .order('likes_count', { ascending: false })
    .limit(50)

  const allQuotes = (quotes ?? []) as unknown as Quote[]

  let likedIds = new Set<string>()
  if (user) {
    const { data: likes } = await supabase
      .from('quote_likes')
      .select('quote_id')
      .eq('user_id', user.id)
      .in('quote_id', allQuotes.map(q => q.id))
    likedIds = new Set((likes ?? []).map(l => l.quote_id as string))
  }

  const heroQuote = allQuotes[0] ?? null
  const restQuotes = allQuotes.slice(1)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Başlık */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">{t('quotes.title')}</h1>
        <p className="text-[--text-secondary] text-sm mt-1">
          {t('quotes.subtitle')}
        </p>
      </div>

      {/* Öne Çıkan Alıntı */}
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
            ✦ {t('quotes.mostLiked')}
          </p>
          <span
            className="absolute top-2 right-5 text-[9rem] font-serif leading-none select-none pointer-events-none"
            style={{ color: '#D4A843', opacity: 0.06 }}
            aria-hidden
          >
            "
          </span>
          <p className="text-2xl sm:text-3xl font-semibold leading-snug mb-4" style={{ color: 'var(--text-primary)' }}>
            &ldquo;{heroQuote.content}&rdquo;
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
              {heroQuote.media_type === 'film' ? `🎬 ${t('quotes.goToMovie')}` : `📺 ${t('quotes.goToSeries')}`}
            </Link>
            {heroQuote.profiles?.username && (
              <span className="text-xs text-[--text-secondary]">
                {t('quotes.sharedBy')}{' '}
                <UserHoverCard username={heroQuote.profiles.username}>
                  <Link href={`/profil/${heroQuote.profiles.username}`} className="hover:text-white transition-colors">
                    @{heroQuote.profiles.username}
                  </Link>
                </UserHoverCard>
              </span>
            )}
            <QuoteLikeButton
              quoteId={heroQuote.id}
              initialLiked={likedIds.has(heroQuote.id)}
              initialCount={heroQuote.likes_count}
            />
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-2xl p-10 text-center text-[--text-secondary]"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          {t('quotes.empty')}
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
                &quot;
              </span>

              <p className="text-lg font-medium text-white leading-snug mb-3 pr-4">
                &ldquo;{quote.content}&rdquo;
              </p>

              {quote.character_name && (
                <p className="italic text-[--text-secondary] text-sm mb-3">
                  — {quote.character_name}
                </p>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/${quote.media_type === 'film' ? 'film' : 'dizi'}/${quote.media_id}`}
                    className="text-xs text-[--accent] hover:underline font-medium"
                  >
                    {quote.media_type === 'film' ? `🎬 ${t('quotes.movie')}` : `📺 ${t('quotes.series')}`} →
                  </Link>
                  <QuoteLikeButton
                    quoteId={quote.id}
                    initialLiked={likedIds.has(quote.id)}
                    initialCount={quote.likes_count}
                  />
                </div>
                {quote.profiles?.username && (
                  <UserHoverCard username={quote.profiles.username}>
                    <Link
                      href={`/profil/${quote.profiles.username}`}
                      className="text-xs text-[--text-secondary] hover:text-white transition-colors"
                    >
                      @{quote.profiles.username}
                    </Link>
                  </UserHoverCard>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {allQuotes.length === 0 && (
        <div className="rounded-2xl p-16 text-center text-[--text-secondary]"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          {t('quotes.empty')}
        </div>
      )}
    </div>
  )
}
