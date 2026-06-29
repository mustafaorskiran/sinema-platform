import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { profileId } = await req.json()
  if (!profileId) return NextResponse.json({ ok: false })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Kendi profilini izleme
  if (user?.id === profileId) return NextResponse.json({ ok: false })
  await supabase.from('profile_views').insert({ viewer_id: user?.id ?? null, profile_id: profileId })
  return NextResponse.json({ ok: true })
}
