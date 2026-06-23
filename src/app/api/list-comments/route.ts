import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const listId = req.nextUrl.searchParams.get('list_id')
  if (!listId) return NextResponse.json({ error: 'list_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('list_comments')
    .select('*, profiles(username, avatar_url)')
    .eq('list_id', listId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { list_id, content } = await req.json()
  if (!list_id || !content?.trim()) return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })

  const { data, error } = await supabase
    .from('list_comments')
    .insert({ list_id, user_id: user.id, content: content.trim() })
    .select('*, profiles(username, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { comment_id } = await req.json()
  const { error } = await supabase
    .from('list_comments')
    .delete()
    .eq('id', comment_id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
