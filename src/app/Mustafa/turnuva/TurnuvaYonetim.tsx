'use client'
import { useState } from 'react'
import { IconCheck, IconTrophy } from '@/components/icons'

export default function TurnuvaYonetim({ tournaments }: { tournaments: any[] }) {
  const [title, setTitle] = useState('')
  const [filmIds, setFilmIds] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgOk, setMsgOk] = useState(false)

  async function create() {
    const ids = filmIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (ids.length !== 8) { setMsg('Tam olarak 8 film ID girin (virgülle ayırın)'); setMsgOk(false); return }
    if (!title.trim()) { setMsg('Başlık girin'); setMsgOk(false); return }
    setLoading(true); setMsg('')
    try {
      const res = await fetch('/api/admin/turnuva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, film_ids: ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg('Turnuva oluşturuldu! Sayfa yenileniyor...')
      setMsgOk(true)
      setTitle(''); setFilmIds('')
      setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Hata oluştu')
      setMsgOk(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-base font-bold text-white mb-1">Yeni Turnuva Oluştur</h2>
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
          8 film ID girin — TMDb ID numaralarını kullanın (örn: 27205 = Inception)
        </p>
        <div className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Turnuva başlığı (örn: En İyi Sci-Fi Filmleri)"
            className="w-full rounded-lg px-4 py-2.5 text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <input
            value={filmIds}
            onChange={e => setFilmIds(e.target.value)}
            placeholder="8 TMDb film ID virgülle: 27205, 157336, 120, 13, 497, 278, 240, 424"
            className="w-full rounded-lg px-4 py-2.5 text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          {msg && (
            <p className={`text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 ${msgOk ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {msgOk && <IconCheck size={14} />}
              {msg}
            </p>
          )}
          <button
            onClick={create}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:scale-105 flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#E11D48,#be123c)' }}>
            {loading ? '...' : <><IconTrophy size={16} /> Turnuva Oluştur</>}
          </button>
        </div>
      </div>

      {tournaments.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="border-b border-[--border]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Turnuva</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Oluşturulma</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Bitiş</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border]">
                {tournaments.map((t: any) => (
                  <tr key={t.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{t.title}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.is_active ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-[--text-secondary]'}`}>
                        {t.is_active ? 'AKTİF' : 'BİTTİ'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[--text-secondary]">{new Date(t.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="px-4 py-3 text-[--text-secondary]">
                      {t.ends_at ? new Date(t.ends_at).toLocaleDateString('tr-TR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
