import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  // Get users I'm already following
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = new Set((following ?? []).map((f: { following_id: string }) => f.following_id))
  followingIds.add(user.id)

  // Get my watched media
  const { data: myWatched } = await supabase
    .from('watchlist')
    .select('media_id, media_type')
    .eq('user_id', user.id)
    .eq('status', 'izledim')
    .limit(200)

  if (!myWatched || myWatched.length === 0) return NextResponse.json([])

  const mySet = new Set(myWatched.map((w: { media_id: number; media_type: string }) => `${w.media_type}-${w.media_id}`))

  // Find other users who watched some of the same content
  const mediaIds = myWatched.map((w: { media_id: number }) => w.media_id)

  const { data: others } = await supabase
    .from('watchlist')
    .select('user_id, media_id, media_type')
    .in('media_id', mediaIds.slice(0, 50))
    .eq('status', 'izledim')
    .neq('user_id', user.id)
    .limit(500)

  if (!others) return NextResponse.json([])

  // Count overlap per user
  const overlapCount = new Map<string, number>()
  for (const row of others) {
    const key = `${row.media_type}-${row.media_id}`
    if (mySet.has(key) && !followingIds.has(row.user_id)) {
      overlapCount.set(row.user_id, (overlapCount.get(row.user_id) ?? 0) + 1)
    }
  }

  // Sort by overlap, take top 10
  const sorted = [...overlapCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  if (sorted.length === 0) return NextResponse.json([])

  const userIds = sorted.map(([id]) => id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio')
    .in('id', userIds)

  if (!profiles) return NextResponse.json([])

  const result = sorted.map(([id, overlap]) => {
    const profile = profiles.find((p: { id: string }) => p.id === id)
    return profile ? { ...profile, common_count: overlap } : null
  }).filter(Boolean)

  return NextResponse.json(result)
}
