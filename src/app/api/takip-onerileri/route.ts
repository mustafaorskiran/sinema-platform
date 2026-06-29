import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ suggestions: [] })

  // Beni takip edenleri çek
  const { data: followers } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', user.id)

  // Benim takip ettiklerimi çek
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const myFollowingIds = new Set((following ?? []).map(f => f.following_id))
  myFollowingIds.add(user.id)

  // Beni takip edip benim takip etmediklerim (karşılıklı olmayan)
  const mutualCandidates = (followers ?? [])
    .map(f => f.follower_id)
    .filter(id => !myFollowingIds.has(id))

  if (mutualCandidates.length === 0) {
    // Rastgele aktif kullanıcılar öner
    const { data: popular } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .not('id', 'eq', user.id)
      .order('created_at', { ascending: false })
      .limit(6)
    return NextResponse.json({ suggestions: popular ?? [], type: 'popular' })
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', mutualCandidates.slice(0, 6))

  return NextResponse.json({ suggestions: profiles ?? [], type: 'mutual' })
}
