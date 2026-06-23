import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { IconStar } from '@/components/icons'
import ModerationActions from './ModerationActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Moderasyon' }

export default async function AdminModerasyonPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [{ data: flagged }, { data: hidden }] = await Promise.all([
    supabase
      .from('reviews')
      .select('*, profiles(username)')
      .eq('flagged_spam', true)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('reviews')
      .select('*, profiles(username)')
      .eq('is_hidden', true)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-white">Moderasyon</h1>
        </div>

        {/* Spam şüphelisi yorumlar */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-white">İnceleme Bekleyen</h2>
            {flagged && flagged.length > 0 && (
              <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                {flagged.length}
              </span>
            )}
          </div>

          {!flagged || flagged.length === 0 ? (
            <p className="text-[--text-secondary] bg-[--bg-card] border border-[--border] rounded-xl p-6 text-center text-sm">
              İnceleme bekleyen yorum yok.
            </p>
          ) : (
            <div className="space-y-3">
              {flagged.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>

        {/* Gizlenmiş yorumlar */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-white">Gizlenenler</h2>
            {hidden && hidden.length > 0 && (
              <span className="text-[10px] font-bold bg-zinc-500/20 text-zinc-400 px-2 py-0.5 rounded-full">
                {hidden.length}
              </span>
            )}
          </div>

          {!hidden || hidden.length === 0 ? (
            <p className="text-[--text-secondary] bg-[--bg-card] border border-[--border] rounded-xl p-6 text-center text-sm">
              Gizlenmiş yorum yok.
            </p>
          ) : (
            <div className="space-y-3">
              {hidden.map((review: any) => (
                <ReviewCard key={review.id} review={review} hidden />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ReviewCard({ review, hidden = false }: { review: any; hidden?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 flex gap-4 items-start ${hidden ? 'bg-zinc-900/50 border-[--border] opacity-70' : 'bg-[--bg-card] border-yellow-500/30'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <a
            href={`/profil/${review.profiles?.username}`}
            className="text-sm font-semibold text-white hover:text-[--accent] transition-colors"
          >
            @{review.profiles?.username}
          </a>
          <a
            href={`/${review.media_type}/${review.media_id}`}
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              review.media_type === 'film' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
            }`}
          >
            {review.media_type} #{review.media_id}
          </a>
          {review.flagged_spam && (
            <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
              link içeriyor
            </span>
          )}
          {hidden && (
            <span className="text-[10px] font-bold bg-zinc-500/20 text-zinc-400 px-2 py-0.5 rounded-full">
              gizli
            </span>
          )}
          <div className="flex items-center gap-0.5 text-[--gold]">
            <IconStar className="h-3 w-3" />
            <span className="text-xs font-semibold text-white">{review.rating}</span>
          </div>
        </div>
        <p className="text-sm text-[--text-secondary] line-clamp-3 mb-2">{review.content}</p>
        {review.moderation_note && (
          <p className="text-xs text-orange-400 italic mb-1">Not: {review.moderation_note}</p>
        )}
        <p className="text-[10px] text-[--text-secondary]">
          {new Date(review.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <ModerationActions id={review.id} isHidden={hidden} />
    </div>
  )
}
