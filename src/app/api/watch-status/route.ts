import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET ?media_id=123&media_type=film
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mediaId = searchParams.get('media_id')
  const mediaType = searchParams.get('media_type')

  if (!mediaId || !mediaType) {
    return NextResponse.json({ status: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ status: null })

  const { data } = await supabase
    .from('watch_status')
    .select('status')
    .eq('user_id', user.id)
    .eq('media_id', Number(mediaId))
    .eq('media_type', mediaType)
    .maybeSingle()

  return NextResponse.json({ status: data?.status ?? null })
}

// POST { media_id, media_type, status }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { media_id: number; media_type: string; status: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { media_id, media_type, status } = body
  if (!media_id || !media_type || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const validStatuses = ['watching', 'completed', 'dropped', 'plan_to_watch', 'on_hold']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { error } = await supabase
    .from('watch_status')
    .upsert(
      {
        user_id: user.id,
        media_id: Number(media_id),
        media_type,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,media_id,media_type' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status })
}

// DELETE { media_id, media_type }
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { media_id: number; media_type: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { media_id, media_type } = body
  if (!media_id || !media_type) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await supabase
    .from('watch_status')
    .delete()
    .eq('user_id', user.id)
    .eq('media_id', Number(media_id))
    .eq('media_type', media_type)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
