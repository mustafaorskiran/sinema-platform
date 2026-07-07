'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

export default function CreatePollForm() {
  const router = useRouter()
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addOption() {
    if (options.length < 6) setOptions(o => [...o, ''])
  }

  function removeOption(i: number) {
    if (options.length <= 2) return
    setOptions(o => o.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validOptions = options.filter(o => o.trim())
    if (!question.trim()) { setError(t('community.pollQuestionRequired')); return }
    if (validOptions.length < 2) { setError(t('community.pollMinOptionsRequired')); return }
    setLoading(true); setError('')
    const res = await fetch('/api/poll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options: validOptions }),
    })
    setLoading(false)
    if (res.ok) {
      setOpen(false)
      setQuestion(''); setOptions(['', ''])
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error ?? t('community.pollGenericError'))
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
        style={{ background: 'var(--accent)', boxShadow: '0 2px 12px rgba(225,29,72,0.3)' }}>
        {t('community.pollCreateButton')}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.98), rgba(14,20,32,0.99))', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{t('community.pollCreateModalTitle')}</h2>
          <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('community.pollQuestionLabel')}</label>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              maxLength={200}
              placeholder={t('community.pollQuestionPlaceholder')}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('community.pollOptionsLabel')}</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={e => setOptions(o => o.map((x, idx) => idx === i ? e.target.value : x))}
                    maxLength={100}
                    placeholder={t('community.pollOptionPlaceholder', { n: i + 1 })}
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-white/30 hover:text-red-400 transition-colors px-2">×</button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button type="button" onClick={addOption} className="text-xs mt-2 transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {t('community.pollAddOption')}
              </button>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              {t('community.pollCancel')}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'var(--accent)' }}>
              {loading ? t('community.pollPublishing') : t('community.pollPublish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
