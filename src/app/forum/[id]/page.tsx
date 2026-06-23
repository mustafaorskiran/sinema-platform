import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import ForumThreadClient from './ForumThreadClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('forum_threads').select('title').eq('id', id).single()
  return { title: data ? `${data.title} — Forum` : 'Forum' }
}

export default async function ForumThreadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: thread }, { data: posts }] = await Promise.all([
    supabase
      .from('forum_threads')
      .select('*, profiles(username, avatar_url), forum_categories(name, slug, icon)')
      .eq('id', id)
      .single(),
    supabase
      .from('forum_posts')
      .select('*, profiles(username, avatar_url)')
      .eq('thread_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!thread) notFound()

  let currentProfile = null
  let isAdmin = false
  if (user) {
    const { data: p } = await supabase.from('profiles').select('username, avatar_url, is_admin').eq('id', user.id).single()
    currentProfile = p
    isAdmin = p?.is_admin ?? false
  }

  const cat = thread.forum_categories as { name: string; slug: string; icon: string } | null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[--text-secondary] mb-6">
        <Link href="/forum" className="hover:text-white transition-colors">Forum</Link>
        <span>/</span>
        {cat && (
          <>
            <Link href={`/forum/kategori/${cat.slug}`} className="hover:text-white transition-colors">
              {cat.icon} {cat.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-white line-clamp-1">{thread.title}</span>
      </div>

      <ForumThreadClient
        thread={thread}
        initialPosts={posts ?? []}
        currentUser={user ? { id: user.id, ...currentProfile } : null}
        isAdmin={isAdmin}
      />
    </div>
  )
}
