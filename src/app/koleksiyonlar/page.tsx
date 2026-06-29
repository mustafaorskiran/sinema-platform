import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Koleksiyon Tamamla | Sinezon',
  description: 'Film koleksiyonlarını tamamla, rozetler kazan.',
}

const COLLECTIONS = [
  {
    key: 'nolan',
    title: 'Christopher Nolan Külliyatı',
    desc: 'The Dark Knight\'tan Oppenheimer\'a tüm Nolan filmleri',
    emoji: '🎭',
    tmdbIds: [155, 49521, 27205, 37165, 109445, 157336, 419430, 522627, 505642],
  },
  {
    key: 'mcu_phase1',
    title: 'MCU 1. Faz',
    desc: 'Iron Man\'dan The Avengers\'a Marvel\'ın ilk fazı',
    emoji: '🦸',
    tmdbIds: [1726, 10138, 10195, 22970, 10364, 24428],
  },
  {
    key: 'oscar_best_pic_2020s',
    title: '2020\'ler Oscar En İyi Film',
    desc: '2020-2024 yılları Oscar En İyi Film ödülü kazananları',
    emoji: '🏆',
    tmdbIds: [581734, 777245, 1217255, 792307, 872585],
  },
  {
    key: 'kubrick',
    title: 'Stanley Kubrick Tüm Filmleri',
    desc: '2001\'den Full Metal Jacket\'a Kubrick\'in başyapıtları',
    emoji: '🎬',
    tmdbIds: [935, 424, 562, 694, 855, 1640, 37165],
  },
  {
    key: 'godfather',
    title: 'Baba Üçlemesi',
    desc: 'Godfather, II ve III',
    emoji: '🌹',
    tmdbIds: [238, 1574, 1576],
  },
  {
    key: 'ghibli',
    title: 'Studio Ghibli Klasikleri',
    desc: 'Miyazaki\'nin en iyi 8 filmi',
    emoji: '🐉',
    tmdbIds: [129, 4935, 12477, 149870, 8392, 37797, 65, 10515],
  },
  {
    key: 'horror_classics',
    title: 'Korku Klasikleri',
    desc: 'The Shining\'den Hereditary\'ye modern korku ikonları',
    emoji: '👻',
    tmdbIds: [694, 539, 568012, 420818, 585083],
  },
  {
    key: 'tarantino',
    title: 'Tarantino Evren',
    desc: 'Pulp Fiction\'dan Once Upon a Time\'a tüm Tarantino',
    emoji: '🩸',
    tmdbIds: [680, 207, 1154, 4390, 16869, 58972, 45243, 522],
  },
]

export default async function KoleksiyonlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris?next=/koleksiyonlar')

  // Kullanıcının izledikleri
  const { data: watched } = await supabase
    .from('watchlist')
    .select('media_id')
    .eq('user_id', user.id)
    .eq('media_type', 'film')
    .eq('status', 'izledim')

  const watchedSet = new Set((watched ?? []).map(w => w.media_id))

  // Başlatılan koleksiyonlar
  const { data: started } = await supabase
    .from('collection_challenges')
    .select('collection_key')
    .eq('user_id', user.id)

  const startedSet = new Set((started ?? []).map(s => s.collection_key))

  async function startCollection(formData: FormData) {
    'use server'
    const key = formData.get('key') as string
    const sb = await createClient()
    const { data: { user: u } } = await sb.auth.getUser()
    if (!u) return
    await sb.from('collection_challenges').upsert({ user_id: u.id, collection_key: key }, { onConflict: 'user_id,collection_key' })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">🎯 Koleksiyon Tamamla</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Film koleksiyonlarını tamamla — ne kadarını izledin?
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {COLLECTIONS.map(col => {
          const watchedCount = col.tmdbIds.filter(id => watchedSet.has(id)).length
          const total = col.tmdbIds.length
          const pct = Math.round((watchedCount / total) * 100)
          const isComplete = watchedCount === total
          const isStarted = startedSet.has(col.key)

          return (
            <div key={col.key} className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: isComplete ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>

              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{col.emoji}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{col.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{col.desc}</p>
                  </div>
                </div>
                {isComplete && (
                  <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                    ✓ Tamam
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{watchedCount} / {total} film</span>
                  <span style={{ color: isComplete ? '#4ade80' : 'rgba(255,255,255,0.5)' }} className="font-bold">%{pct}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: isComplete ? 'linear-gradient(90deg,#4ade80,#22c55e)' : 'linear-gradient(90deg,var(--accent),#f97316)' }} />
                </div>
              </div>

              {/* Film ID listesi */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {col.tmdbIds.map(id => (
                  <Link key={id} href={`/film/${id}`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110"
                    style={watchedSet.has(id)
                      ? { background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }
                    }
                    title={`Film #${id}`}>
                    {watchedSet.has(id) ? '✓' : '○'}
                  </Link>
                ))}
              </div>

              {!isStarted && !isComplete && (
                <form action={startCollection}>
                  <input type="hidden" name="key" value={col.key} />
                  <button type="submit"
                    className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-105"
                    style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.25)', color: 'rgba(225,29,72,0.8)' }}>
                    🎯 Koleksiyona Başla
                  </button>
                </form>
              )}
              {isStarted && !isComplete && (
                <p className="text-[11px]" style={{ color: 'rgba(74,222,128,0.7)' }}>🎯 Aktif koleksiyon</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
