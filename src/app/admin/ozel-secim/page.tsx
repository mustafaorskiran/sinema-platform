import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import FeaturedPickForm from './FeaturedPickForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Özel Seçim — Admin' }

export default async function OzelSecimPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: picks } = await supabase
    .from('featured_picks')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(10)

  const enriched = await Promise.all(
    (picks ?? []).map(async (p: any) => {
      try {
        const media = p.media_type === 'dizi'
          ? await getSeriesDetail(p.media_id)
          : await getMovieDetail(p.media_id)
        return {
          ...p,
          title: getMediaTitle(media),
          poster: getPosterUrl(media.poster_path, 'w342'),
        }
      } catch {
        return { ...p, title: `#${p.media_id}`, poster: null }
      }
    })
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Özel Seçim</h1>
      <p className="text-[--text-secondary] text-sm mb-8">
        Ana sayfada gösterilecek haftanın filmi / dizisi seçimi
      </p>

      <FeaturedPickForm />

      {enriched.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-white mb-4">Geçmiş Seçimler</h2>
          <div className="space-y-3">
            {enriched.map((p: any) => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                {p.poster && (
                  <img src={p.poster} alt={p.title} className="w-12 h-18 rounded-lg object-cover shrink-0" style={{ height: '72px' }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{p.title}</p>
                  <p className="text-xs text-[--accent] mt-0.5">{p.label} · {p.media_type}</p>
                  {p.note && <p className="text-xs text-[--text-secondary] mt-1">{p.note}</p>}
                  <p className="text-[10px] text-[--text-secondary] mt-1">
                    {new Date(p.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {p.profiles?.username && ` · @${p.profiles.username}`}
                  </p>
                </div>
                <DeletePickButton id={p.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DeletePickButton({ id }: { id: number }) {
  return (
    <form action={`/api/featured-pick?id=${id}`} method="post">
      <input type="hidden" name="_method" value="DELETE" />
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40"
      >
        Kaldır
      </button>
    </form>
  )
}
