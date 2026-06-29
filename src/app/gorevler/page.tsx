import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Günlük Görevler — Sinezon' }

const DAILY_TASKS = [
  { key: 'rate_3', label: '3 film/dizi puanla', desc: 'Bugün en az 3 içeriğe puan ver', xp: 15, icon: '⭐' },
  { key: 'write_review', label: 'Yorum yaz', desc: 'Herhangi bir film veya diziye yorum ekle', xp: 25, icon: '✍️' },
  { key: 'add_diary', label: 'Günlüğe kayıt ekle', desc: 'Film günlüğüne izlediğini ekle', xp: 10, icon: '📖' },
  { key: 'follow_someone', label: 'Birini takip et', desc: 'Yeni bir kullanıcı keşfet ve takip et', xp: 5, icon: '👥' },
  { key: 'update_watchlist', label: 'İzleme listeni güncelle', desc: 'Listeye film/dizi ekle ya da işaretle', xp: 8, icon: '📋' },
]

export default async function GorevlerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const today = new Date().toISOString().split('T')[0]
  const todayStart = `${today}T00:00:00.000Z`
  const todayEnd = `${today}T23:59:59.999Z`

  // Paralel query — bugünkü aktiviteler
  const [
    { count: todayWatchlistIzledim },
    { count: todayReviewCount },
    { count: todayDiaryCount },
    { count: todayFollowCount },
    { count: todayWatchlistAny },
  ] = await Promise.all([
    supabase.from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'izledim')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
    supabase.from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
    supabase.from('diary_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
    supabase.from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id)
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
    supabase.from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd),
  ])

  // Görev tamamlanma durumları
  const taskStatus: Record<string, boolean> = {
    rate_3: ((todayWatchlistIzledim ?? 0) >= 3) || ((todayReviewCount ?? 0) >= 3),
    write_review: (todayReviewCount ?? 0) >= 1,
    add_diary: (todayDiaryCount ?? 0) >= 1,
    follow_someone: (todayFollowCount ?? 0) >= 1,
    update_watchlist: (todayWatchlistAny ?? 0) >= 1,
  }

  const completedToday = new Set(
    Object.entries(taskStatus).filter(([, done]) => done).map(([key]) => key)
  )

  // Tamamlanan görevleri daily_task_completions'a kaydet (sadece yeni olanları)
  if (completedToday.size > 0) {
    const { data: existingCompletions } = await supabase
      .from('daily_task_completions')
      .select('task_key')
      .eq('user_id', user.id)
      .eq('completed_date', today)

    const alreadyCompleted = new Set((existingCompletions ?? []).map((c: any) => c.task_key))

    const newCompletions = [...completedToday]
      .filter(key => !alreadyCompleted.has(key))
      .map(key => ({
        user_id: user.id,
        task_key: key,
        completed_date: today,
        xp_awarded: DAILY_TASKS.find(t => t.key === key)?.xp ?? 0,
      }))

    if (newCompletions.length > 0) {
      await supabase.from('daily_task_completions').insert(newCompletions)
    }
  }

  const totalXP = DAILY_TASKS.reduce((s, t) => s + t.xp, 0)
  const earnedXP = DAILY_TASKS.filter(t => completedToday.has(t.key)).reduce((s, t) => s + t.xp, 0)

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-white">🎯 Günlük Görevler</h1>
        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(225,29,72,0.1)', color: '#E11D48', border: '1px solid rgba(225,29,72,0.2)' }}>
          {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* XP bar */}
      <div className="rounded-xl p-4 mb-6" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Bugünkü XP</span>
          <span className="text-sm font-bold" style={{ color: '#D4A843' }}>{earnedXP} / {totalXP} XP</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${totalXP > 0 ? (earnedXP / totalXP) * 100 : 0}%`, background: 'linear-gradient(90deg,#D4A843,#f59e0b)' }}
          />
        </div>
      </div>

      {/* Görevler */}
      <div className="space-y-3">
        {DAILY_TASKS.map(task => {
          const done = completedToday.has(task.key)
          return (
            <div
              key={task.key}
              className="flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{
                background: done ? 'rgba(52,211,153,0.06)' : 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))',
                border: done ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="text-2xl shrink-0">{task.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${done ? 'text-green-400 line-through opacity-60' : 'text-white'}`}>
                  {task.label}
                </p>
                <p className="text-xs text-[--text-secondary]">{task.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold" style={{ color: done ? '#34d399' : '#D4A843' }}>+{task.xp} XP</span>
                {done && <p className="text-[10px] text-green-400 mt-0.5">✓ Tamamlandı</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tüm görevler bitti mi? */}
      {completedToday.size === DAILY_TASKS.length && (
        <div className="text-center mt-8 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.08),rgba(16,185,129,0.04))', border: '1px solid rgba(52,211,153,0.2)' }}>
          <p className="text-3xl mb-2">🏆</p>
          <p className="font-bold text-green-400 mb-1">Tüm görevleri tamamladın!</p>
          <p className="text-xs text-[--text-secondary]">Yarın yeni görevler gelecek</p>
        </div>
      )}
    </div>
  )
}
