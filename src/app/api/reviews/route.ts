import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { checkSpam } from '@/lib/spamCheck'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Giriş yapman gerekiyor.' }, { status: 401 })

  // Ban check
  const { data: profile } = await supabase.from('profiles').select('banned').eq('id', user.id).single()
  if (profile?.banned) return NextResponse.json({ error: 'Hesabın yasaklanmış.' }, { status: 403 })

  // Rate limit: 5 reviews per minute
  if (!await rateLimit(`review:${user.id}`, 60_000, 5)) {
    return NextResponse.json({ error: 'Çok fazla yorum gönderdin. Lütfen bekle.' }, { status: 429 })
  }

  const body = await request.json()
  const { media_id, media_type, rating, content, has_spoiler = false, tags = [] } = body

  if (!media_id || !media_type || !rating || !content) {
    return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 })
  }

  // Spam check
  const spam = checkSpam(user.id, content)
  if (spam.blocked) {
    return NextResponse.json({ error: spam.error }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      media_id,
      media_type,
      rating,
      content,
      has_spoiler,
      tags,
      flagged_spam: spam.flagged,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Bu içerik için zaten yorum yaptın.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Giriş yapman gerekiyor.' }, { status: 401 })

  // Rate limit: 10 edits per minute
  if (!await rateLimit(`review-edit:${user.id}`, 60_000, 10)) {
    return NextResponse.json({ error: 'Çok fazla düzenleme. Lütfen bekle.' }, { status: 429 })
  }

  const body = await request.json()
  const { id, rating, content, has_spoiler, tags } = body

  if (!id || !rating || !content) {
    return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 })
  }

  const spam = checkSpam(user.id, content)
  if (spam.blocked) {
    return NextResponse.json({ error: spam.error }, { status: 422 })
  }

  const updateData: Record<string, unknown> = {
    rating,
    content,
    updated_at: new Date().toISOString(),
    flagged_spam: spam.flagged,
  }
  if (has_spoiler !== undefined) updateData.has_spoiler = has_spoiler
  if (tags !== undefined) updateData.tags = tags

  const { data, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Giriş yapman gerekiyor.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 })

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
