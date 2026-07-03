'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

interface TriviaItem {
  id: string
  content: string
  type: 'trivia' | 'goof'
  profiles: { username: string } | null
  created_at: string
}

interface Props {
  items: TriviaItem[]
  mediaId: number
  mediaType: 'film' | 'dizi'
  isLoggedIn: boolean
}

export default function TriviaSection({ items, mediaId, mediaType, isLoggedIn }: Props) {
  const { t } = useLocale()
  const router = useRouter()
  const [tab, setTab] = useState<'trivia' | 'goof'>('trivia')
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const filtered = items.filter(i => i.type === tab)

  async function submit() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    await fetch('/api/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType, type: tab, content: content.trim() }),
    })
    setSubmitting(false)
    setContent('')
    setShowForm(false)
    setDone(true)
    router.refresh()
  }

  if (items.length === 0 && !isLoggedIn) return null

  return (
    <div className="mt-12" id="trivia">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)' }} />
          <h2 className="text-xl font-bold text-white tracking-tight">
            {tab === 'trivia' ? `💡 ${t('trivia.triviaHeading')}` : `🎬 ${t('trivia.goofsHeading')}`}
          </h2>
          <div className="flex rounded-lg p-0.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => { setTab('trivia'); setShowForm(false) }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${tab === 'trivia' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}
            >
              {t('trivia.triviaTabLabel', { count: items.filter(i => i.type === 'trivia').length })}
            </button>
            <button
              onClick={() => { setTab('goof'); setShowForm(false) }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${tab === 'goof' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}
            >
              {t('trivia.goofsTabLabel', { count: items.filter(i => i.type === 'goof').length })}
            </button>
          </div>
        </div>
        {isLoggedIn && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-[--accent] hover:underline"
          >
            + {t('trivia.addButton')}
          </button>
        )}
      </div>

      {done && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-green-500/20 text-green-300 text-sm border border-green-500/30">
          {t('trivia.submittedNotice')}
        </div>
      )}

      {showForm && (
        <div className="mb-5 rounded-xl p-4"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {tab === 'trivia' ? t('trivia.addTriviaHint') : t('trivia.addGoofHint')}
          </p>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={tab === 'trivia' ? t('trivia.triviaPlaceholder') : t('trivia.goofPlaceholder')}
            className="w-full rounded-lg p-3 text-sm text-white outline-none resize-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(225,29,72,0.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => setShowForm(false)}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('common.cancel')}
            </button>
            <button onClick={submit} disabled={!content.trim() || submitting}
              className="text-xs px-4 py-1.5 rounded-lg text-white font-semibold disabled:opacity-40 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>
              {submitting ? `⟳ ${t('trivia.sending')}` : t('common.submit')}
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-8 text-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('trivia.emptyNotice', { type: tab === 'trivia' ? t('trivia.emptyTriviaText') : t('trivia.emptyGoofText') })}</p>
          {isLoggedIn && !showForm && (
            <button onClick={() => setShowForm(true)} className="mt-2 text-xs hover:underline" style={{ color: 'var(--accent)' }}>
              {t('trivia.beFirst')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item, idx) => (
            <div key={item.id} className="flex gap-3 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                style={{ background: 'rgba(225,29,72,0.15)', color: 'var(--accent)' }}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-relaxed">{item.content}</p>
                {item.profiles?.username && (
                  <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <a href={`/profil/${item.profiles.username}`} className="hover:text-white transition-colors">
                      @{item.profiles.username}
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
