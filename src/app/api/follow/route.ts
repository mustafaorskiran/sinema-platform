import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushToUser } from '@/lib/pushNotify'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { following_id } = await req.json()
  if (following_id === user.id) return NextResponse.json({ error: 'Kendinizi takip edemezsiniz' }, { status: 400 })

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Takip edilen kişiye bildirim gönder
  const { data: followerProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
  await Promise.all([
    supabase.from('notifications').insert({ user_id: following_id, actor_id: user.id, type: 'follow', review_id: null }),
    sendPushToUser(following_id, '👤 Yeni takipçi', `@${followerProfile?.username ?? 'Biri'} seni takip etmeye başladı`, `/profil/${followerProfile?.username}`),
  ])

  // E-posta bildirimi (RESEND_API_KEY varsa)
  if (process.env.RESEND_API_KEY && process.env.INTERNAL_API_KEY) {
    const [{ data: targetProfile }, { data: actorProfile }] = await Promise.all([
      supabase.from('profiles').select('email_on_follow').eq('id', following_id).single(),
      supabase.from('profiles').select('username').eq('id', user.id).single(),
    ])
    if (targetProfile?.email_on_follow) {
      const { data: targetUser } = await supabase.auth.admin.getUserById(following_id)
      if (targetUser?.user?.email) {
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.INTERNAL_API_KEY },
          body: JSON.stringify({
            to: targetUser.user.email,
            subject: `${actorProfile?.username} seni takip etmeye başladı`,
            html: `<p><strong>${actorProfile?.username}</strong> Sinezon'da seni takip etmeye başladı! <a href="${process.env.NEXT_PUBLIC_SITE_URL}/profil/${actorProfile?.username}">Profilini görüntüle →</a></p>`,
          }),
        }).catch(() => {})
      }
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { following_id } = await req.json()

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', following_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
