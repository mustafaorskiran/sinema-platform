'use client'
import { useState } from 'react'
import Link from 'next/link'

const QUESTIONS = [
  {
    q: 'Film izlerken en çok ne istersin?',
    options: [
      { label: 'Duygusal derinlik', types: ['Drama Kaşifi', 'Sinefil'] },
      { label: 'Heyecan ve gerilim', types: ['Aksiyon Tutkunu', 'Thriller Uzmanı'] },
      { label: 'Güldürü ve hafiflik', types: ['Komedi Sever', 'Genel İzleyici'] },
      { label: 'Düşündürücü sorular', types: ['Sinefil', 'Arthouse Sevdalısı'] },
    ]
  },
  {
    q: 'Hangi dönemi tercih edersin?',
    options: [
      { label: '2000 sonrası', types: ['Aksiyon Tutkunu', 'Genel İzleyici'] },
      { label: '1980-2000 arası', types: ['Nostalji Gurmesi', 'Drama Kaşifi'] },
      { label: 'Altın çağ (1950-1980)', types: ['Sinefil', 'Arthouse Sevdalısı'] },
      { label: 'Fark etmez, yılı önemli değil', types: ['Genel İzleyici', 'Drama Kaşifi'] },
    ]
  },
  {
    q: 'Film seçerken ilk baktığın şey?',
    options: [
      { label: 'Yönetmen', types: ['Sinefil', 'Arthouse Sevdalısı'] },
      { label: 'Oyuncu kadrosu', types: ['Drama Kaşifi', 'Komedi Sever'] },
      { label: 'Fragman / görsel', types: ['Aksiyon Tutkunu', 'Genel İzleyici'] },
      { label: 'IMDb/RT puanı', types: ['Nostalji Gurmesi', 'Genel İzleyici'] },
    ]
  },
  {
    q: 'Hangi film seni en çok etkiler?',
    options: [
      { label: 'Ağlatan bir drama', types: ['Drama Kaşifi', 'Sinefil'] },
      { label: 'Sürükleyici aksiyon', types: ['Aksiyon Tutkunu'] },
      { label: 'Kafayı karıştıran senaryo', types: ['Thriller Uzmanı', 'Sinefil'] },
      { label: 'Güldürüp düşündüren', types: ['Komedi Sever', 'Arthouse Sevdalısı'] },
    ]
  },
  {
    q: 'Yabancı film (altyazılı) hakkında?',
    options: [
      { label: 'Bayılırım, ülke fark etmez', types: ['Sinefil', 'Arthouse Sevdalısı'] },
      { label: 'Arasıra izlerim', types: ['Drama Kaşifi', 'Nostalji Gurmesi'] },
      { label: 'Pek tercih etmem', types: ['Aksiyon Tutkunu', 'Genel İzleyici'] },
      { label: 'Sadece popüler olanları', types: ['Genel İzleyici', 'Komedi Sever'] },
    ]
  },
]

const TYPE_DESCRIPTIONS: Record<string, { emoji: string; desc: string; color: string }> = {
  'Sinefil': { emoji: '🎭', desc: 'Sinemayı bir sanat olarak görüyorsun. Yönetmen vizyonu ve sinematografi senin için her şey.', color: '#a78bfa' },
  'Drama Kaşifi': { emoji: '😢', desc: 'Derinlikli karakterler ve duygusal yolculuklar seni büyülüyor. Gerçekçi hikayelere bayılırsın.', color: '#60a5fa' },
  'Aksiyon Tutkunu': { emoji: '💥', desc: 'Hız, enerji ve adrenalin istiyorsun. Süper kahraman filmleri senkronize izleme deneyimlerin.', color: '#f87171' },
  'Thriller Uzmanı': { emoji: '🔍', desc: 'Bükülmüş senaryolar ve beklenmedik finallerden keyif alıyorsun. Dedektif gibi izliyorsun.', color: '#34d399' },
  'Komedi Sever': { emoji: '😂', desc: 'Her şeyde hafif tarafını arıyorsun. Gülmek ve eğlenmek senin için birinci öncelik.', color: '#fbbf24' },
  'Arthouse Sevdalısı': { emoji: '🎨', desc: 'Alışılmışın dışına çıkan, sınırları zorlayan filmler seni büyülüyor. Bağımsız sinemayı seviyorsun.', color: '#f472b6' },
  'Nostalji Gurmesi': { emoji: '📽️', desc: 'Klasikler ve altın çağ filmleri senin için benzersiz. Geçmişin büyüsünü yaşatıyorsun.', color: '#D4A843' },
  'Genel İzleyici': { emoji: '🍿', desc: 'Her türden zevk alan, esnek ve açık fikirli bir izleyicisin. Film sevgin saf ve içten.', color: '#94a3b8' },
}

export default function SinezonTurumPage() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<string[][]>([])
  const [result, setResult] = useState<string | null>(null)

  function answer(types: string[]) {
    const newAnswers = [...answers, types]
    if (current + 1 >= QUESTIONS.length) {
      // Sonuç hesapla
      const freq: Record<string, number> = {}
      for (const a of newAnswers) for (const t of a) freq[t] = (freq[t] ?? 0) + 1
      const winner = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
      setResult(winner)
    } else {
      setAnswers(newAnswers)
      setCurrent(current + 1)
    }
  }

  function reset() { setCurrent(0); setAnswers([]); setResult(null) }

  const q = QUESTIONS[current]
  const info = result ? TYPE_DESCRIPTIONS[result] ?? TYPE_DESCRIPTIONS['Genel İzleyici'] : null

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">🎬 Sinezon Türün Nedir?</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>5 soruda sinema kişiliğini keşfet</p>
      </div>

      {result && info ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: `1px solid ${info.color}33` }}>
          <div className="text-5xl mb-4">{info.emoji}</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: info.color }}>{result}</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>{info.desc}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={reset}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              🔄 Tekrar Dene
            </button>
            <Link href="/filmler"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#E11D48,#be123c)', boxShadow: '0 4px 14px rgba(225,29,72,0.25)' }}>
              Film Keşfet →
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {QUESTIONS.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all"
                style={{ background: i <= current ? '#E11D48' : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
          <p className="text-xs mb-3 font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Soru {current + 1} / {QUESTIONS.length}
          </p>
          <h2 className="text-lg font-bold text-white mb-5">{q.q}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => answer(opt.types)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01] hover:border-[--accent]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
