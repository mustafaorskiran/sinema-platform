import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sayfa?: string }>
}

const PAGE_SIZE = 20

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'az önce'
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('forum_categories').select('name').eq('slug', slug).single()
  return { title: data ? `${data.name} — Forum` : 'Forum' }
}

export default async function KategoriPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()
  const { data: category } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: threads, count } = await supabase
    .from('forum_threads')
    .select('id, title, reply_count, last_reply_at, pinned, locked, profiles(username)', { count: 'exact' })
    .eq('category_id', category.id)
    .order('pinned', { ascending: false })
    .order('last_reply_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/forum" className="text-sm text-[--text-secondary] hover:text-white transition-colors">← Forum</Link>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{category.name}</h1>
            <p className="text-sm text-[--text-secondary]">{category.description}</p>
          </div>
        </div>
        <Link
          href={`/forum/yeni?kategori=${category.id}`}
          className="bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
        >
          + Konu Aç
        </Link>
      </div>

      <div className="rounded-xl bg-[--bg-card] border border-[--border] divide-y divide-[--border]">
        {(threads ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[--text-secondary] text-sm">Bu kategoride henüz konu yok.</p>
            <Link href={`/forum/yeni?kategori=${category.id}`} className="mt-4 inline-block text-sm text-[--accent] hover:underline">
              İlk konuyu sen aç →
            </Link>
          </div>
        ) : (
          (threads ?? []).map((thread) => {
            const profile = thread.profiles as unknown as { username: string } | null
            return (
              <Link
                key={thread.id}
                href={`/forum/${thread.id}`}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-[--bg-secondary] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {thread.pinned && <span className="text-xs">📌</span>}
                    {thread.locked && <span className="text-xs">🔒</span>}
                    <p className="font-medium text-white group-hover:text-[--accent] transition-colors line-clamp-1">
                      {thread.title}
                    </p>
                  </div>
                  <p className="text-xs text-[--text-secondary] mt-0.5">
                    {profile?.username} · {timeAgo(thread.last_reply_at)}
                  </p>
                </div>
                <span className="text-xs text-[--text-secondary] shrink-0">{thread.reply_count} yanıt</span>
              </Link>
            )
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          {page > 1 && (
            <Link href={`/forum/kategori/${slug}?sayfa=${page - 1}`}
              className="px-5 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white transition-colors">
              ← Önceki
            </Link>
          )}
          <span className="px-5 py-2 text-sm text-[--text-secondary] flex items-center">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/forum/kategori/${slug}?sayfa=${page + 1}`}
              className="px-5 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white transition-colors">
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
