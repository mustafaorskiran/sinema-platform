import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50)

  const supabase = await createClient()

  let query = supabase
    .from('forum_threads')
    .select('id, title, reply_count, last_reply_at, pinned, profiles(username), forum_categories(name, slug)')
    .order('pinned', { ascending: false })
    .order('last_reply_at', { ascending: false })
    .limit(limit)

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ threads: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  // Ban check
  const { data: profile } = await supabase.from('profiles').select('banned').eq('id', user.id).single()
  if (profile?.banned) return NextResponse.json({ error: 'Hesabın yasaklanmış.' }, { status: 403 })

  // Rate limit: 2 threads per 5 minutes
  if (!await rateLimit(`forum-thread:${user.id}`, 5 * 60_000, 2)) {
    return NextResponse.json({ error: 'Çok fazla konu açtın. 5 dakika bekle.' }, { status: 429 })
  }

  const { title, content, category_id } = await req.json()
  if (!title?.trim() || !content?.trim() || !category_id) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  }

  if (title.trim().length < 5) {
    return NextResponse.json({ error: 'Başlık en az 5 karakter olmalı.' }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('forum_threads')
    .insert({ title: title.trim(), content: content.trim(), category_id, user_id: user.id })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
