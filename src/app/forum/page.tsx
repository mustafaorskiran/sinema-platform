import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Forum' }

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'az önce'
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

export default async function ForumPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: recentThreads }] = await Promise.all([
    supabase
      .from('forum_categories')
      .select('*, forum_threads(count)')
      .order('order'),
    supabase
      .from('forum_threads')
      .select('id, title, reply_count, last_reply_at, pinned, profiles(username), forum_categories(name, slug)')
      .order('pinned', { ascending: false })
      .order('last_reply_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Forum</h1>
          <p className="text-[--text-secondary] text-sm mt-1">Sinema hakkında konuş, tartış, keşfet</p>
        </div>
        <Link
          href="/forum/yeni"
          className="bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
        >
          + Konu Aç
        </Link>
      </div>

      {/* Kategoriler */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[--text-secondary] mb-3">Kategoriler</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(categories ?? []).map((cat) => {
            const count = (cat.forum_threads as unknown as { count: number }[])?.[0]?.count ?? 0
            return (
              <Link
                key={cat.id}
                href={`/forum/kategori/${cat.slug}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-[--bg-card] border border-[--border] hover:border-[--accent]/40 transition-colors group"
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
      </div>

      {/* Son Konular */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[--text-secondary] mb-3">Son Konular</h2>
        <div className="rounded-xl bg-[--bg-card] border border-[--border] divide-y divide-[--border]">
          {(recentThreads ?? []).length === 0 ? (
            <div className="py-12 text-center text-[--text-secondary] text-sm">Henüz konu açılmamış.</div>
          ) : (
            (recentThreads ?? []).map((thread) => {
              const profile = thread.profiles as unknown as { username: string } | null
              const cat = thread.forum_categories as unknown as { name: string; slug: string } | null
              return (
                <Link
                  key={thread.id}
                  href={`/forum/${thread.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-[--bg-secondary] transition-colors group"
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
