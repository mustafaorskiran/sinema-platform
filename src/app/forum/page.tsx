import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Forum | Sinezon' }

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'az önce'
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

interface Props {
  searchParams: Promise<{ q?: string; kategori?: string }>
}

export default async function ForumPage({ searchParams }: Props) {
  const { q, kategori } = await searchParams
  const query = q?.trim() ?? ''
  const kategoriFilter = kategori?.trim() ?? ''

  const supabase = await createClient()

  // Kategoriler her zaman göster
  const categoriesPromise = supabase
    .from('forum_categories')
    .select('id, name, slug, icon, description, order, forum_threads(count)')
    .order('order')

  // Thread query
  let threadQuery = supabase
    .from('forum_threads')
    .select('id, title, reply_count, last_reply_at, pinned, profiles(username), forum_categories(id, name, slug)')
    .order('pinned', { ascending: false })
    .order('last_reply_at', { ascending: false })

  if (query) {
    // pg_trgm ile title + content araması
    threadQuery = threadQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    threadQuery = threadQuery.limit(30)
  } else if (kategoriFilter) {
    // Kategoriye göre filtrele
    const { data: cat } = await supabase.from('forum_categories').select('id').eq('slug', kategoriFilter).single()
    if (cat?.id) threadQuery = threadQuery.eq('category_id', cat.id)
    threadQuery = threadQuery.limit(20)
  } else {
    threadQuery = threadQuery.limit(15)
  }

  const [{ data: categories }, { data: recentThreads }] = await Promise.all([
    categoriesPromise,
    threadQuery,
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Forum</h1>
          <p className="text-[--text-secondary] text-sm mt-1">Sinema hakkında konuş, tartış, keşfet</p>
        </div>
        <Link
          href="/forum/yeni"
          className="bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shrink-0"
        >
          + Konu Aç
        </Link>
      </div>

      {/* Arama Kutusu */}
      <form method="GET" action="/forum" className="mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-secondary] pointer-events-none select-none">
            🔍
          </span>
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Başlık veya içerikte ara..."
            className="w-full pl-9 pr-16 py-2.5 rounded-xl text-white placeholder-[--text-secondary] text-sm focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <a href="/forum" className="text-xs text-[--text-secondary] hover:text-white transition-colors">✕</a>
            )}
            <button type="submit" className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              Ara
            </button>
          </div>
        </div>
        {query && (
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span style={{ color: 'var(--gold)' }}>{(recentThreads ?? []).length}</span> sonuç bulundu
          </p>
        )}
      </form>

      {/* Kategoriler */}
      {!query && (
        <div className="mb-8">
          {/* Kategori filtre sekmeleri */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            <Link
              href="/forum"
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={!kategoriFilter
                ? { background: 'var(--accent)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Tümü
            </Link>
            {(categories ?? []).map((cat) => (
              <Link
                key={cat.id}
                href={`/forum?kategori=${cat.slug}`}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={kategoriFilter === cat.slug
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Kategori kartları sadece "Tümü" seçiliyken */}
          {!kategoriFilter && (
            <div className="grid sm:grid-cols-2 gap-3">
              {(categories ?? []).map((cat) => {
                const count = (cat.forum_threads as unknown as { count: number }[])?.[0]?.count ?? 0
                return (
                  <Link
                    key={cat.id}
                    href={`/forum?kategori=${cat.slug}`}
                    className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group"
                    style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-2xl shrink-0">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white group-hover:text-[--accent] transition-colors">{cat.name}</p>
                      <p className="text-xs text-[--text-secondary] mt-0.5 line-clamp-1">{cat.description}</p>
                    </div>
                    <span className="text-xs text-[--text-secondary] shrink-0">{count} konu</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Son Konular / Arama Sonuçları */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[--text-secondary]">
            {query
              ? `"${query}" için sonuçlar`
              : kategoriFilter
              ? `${(categories ?? []).find(c => c.slug === kategoriFilter)?.name ?? kategoriFilter} Konuları`
              : 'Son Konular'}
          </h2>
          {!query && (
            <Link href="/forum/yeni" className="text-xs font-medium transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              + Konu Aç
            </Link>
          )}
        </div>
        <div className="rounded-xl divide-y overflow-hidden"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.04)' }}>
          {(recentThreads ?? []).length === 0 ? (
            <div className="py-12 text-center text-[--text-secondary] text-sm">
              {query ? `"${query}" için sonuç bulunamadı.` : 'Henüz konu açılmamış.'}
            </div>
          ) : (
            (recentThreads ?? []).map((thread) => {
              const profile = thread.profiles as unknown as { username: string } | null
              const cat = thread.forum_categories as unknown as { name: string; slug: string } | null
              return (
                <Link
                  key={thread.id}
                  href={`/forum/${thread.id}`}
                  className="flex items-center gap-4 px-4 py-3 transition-colors group hover:bg-white/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {thread.pinned && (
                        <span className="text-[10px] font-bold uppercase text-[--accent] shrink-0">📌</span>
                      )}
                      <p className="font-medium text-white group-hover:text-[--accent] transition-colors line-clamp-1">
                        {thread.title}
                      </p>
                    </div>
                    <p className="text-xs text-[--text-secondary] mt-0.5">
                      <span className="text-[--text-secondary]/70">{cat?.name}</span>
                      {' · '}
                      {profile?.username}
                      {' · '}
                      {timeAgo(thread.last_reply_at)}
                    </p>
                  </div>
                  <span className="text-xs text-[--text-secondary] shrink-0">{thread.reply_count} yanıt</span>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
