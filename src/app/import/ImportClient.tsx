'use client'

import { useState, useRef } from 'react'

interface ImportResult {
  total: number
  added: number
  skipped: number
  notFound: number
  errors: string[]
}

export default function ImportClient() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File | null) {
    if (!f) return
    if (!f.name.endsWith('.csv')) { setError('Sadece .csv dosyası yükleyebilirsin.'); return }
    if (f.size > 5 * 1024 * 1024) { setError('Dosya boyutu 5MB\'dan büyük olamaz.'); return }
    setFile(f)
    setError('')
    setResult(null)
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setError('')
    setProgress(0)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(Boolean)
      if (lines.length < 2) { setError('CSV dosyası geçerli değil veya boş.'); setLoading(false); return }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
      const nameIdx  = headers.indexOf('name')
      const yearIdx  = headers.indexOf('year')
      const ratingIdx = headers.indexOf('rating')

      if (nameIdx === -1) { setError('CSV formatı tanınamadı. "Name" sütunu bulunamadı.'); setLoading(false); return }

      const entries = lines.slice(1).map(line => {
        const cols = line.match(/(".*?"|[^,]+|(?<=,)(?=,))/g) ?? line.split(',')
        return {
          name:   (cols[nameIdx]   ?? '').replace(/"/g, '').trim(),
          year:   (cols[yearIdx]   ?? '').replace(/"/g, '').trim(),
          rating: (cols[ratingIdx] ?? '').replace(/"/g, '').trim(),
        }
      }).filter(e => e.name)

      const BATCH = 10
      let added = 0, skipped = 0, notFound = 0
      const errors: string[] = []

      for (let i = 0; i < entries.length; i += BATCH) {
        const batch = entries.slice(i, i + BATCH)
        const res = await fetch('/api/import/letterboxd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: batch }),
        })
        if (res.ok) {
          const data = await res.json()
          added   += data.added   ?? 0
          skipped += data.skipped ?? 0
          notFound += data.notFound ?? 0
          errors.push(...(data.errors ?? []))
        }
        setProgress(Math.round(((i + BATCH) / entries.length) * 100))
      }

      setResult({ total: entries.length, added, skipped, notFound, errors: errors.slice(0, 5) })
    } catch (e) {
      setError('Dosya işlenemedi. Lütfen tekrar dene.')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      {/* Yükleme Alanı */}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault() }}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0] ?? null) }}
        className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
        style={{
          borderColor: file ? 'rgba(212,168,67,0.4)' : 'rgba(255,255,255,0.1)',
          background: file ? 'rgba(212,168,67,0.04)' : 'rgba(255,255,255,0.02)',
        }}>
        <input ref={inputRef} type="file" accept=".csv" className="hidden"
          onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div>
            <div className="text-2xl mb-2">📄</div>
            <p className="font-semibold text-sm" style={{ color: '#D4A843' }}>{file.name}</p>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {(file.size / 1024).toFixed(1)} KB — başka dosya seçmek için tıkla
            </p>
          </div>
        ) : (
          <div>
            <div className="text-3xl mb-2">📂</div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              CSV dosyasını sürükle & bırak veya tıkla
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Letterboxd &quot;watched.csv&quot; dosyası — maks 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}

      {/* Progress */}
      {loading && (
        <div>
          <div className="flex justify-between text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span>İşleniyor...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #D4A843, #E11D48)' }} />
          </div>
        </div>
      )}

      {/* Sonuç */}
      {result && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.1)' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(212,168,67,0.08)', background: 'rgba(212,168,67,0.02)' }}>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
              İçe Aktarma Sonucu
            </p>
          </div>
          <div className="grid grid-cols-4 divide-x divide-white/5">
            {[
              { label: 'Toplam', value: result.total, color: 'var(--text-primary)' },
              { label: 'Eklendi', value: result.added, color: '#4ade80' },
              { label: 'Zaten Var', value: result.skipped, color: 'rgba(255,255,255,0.4)' },
              { label: 'Bulunamadı', value: result.notFound, color: '#f87171' },
            ].map(s => (
              <div key={s.label} className="text-center px-4 py-4" style={{ borderRight: '1px solid rgba(212,168,67,0.06)' }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          {result.errors.length > 0 && (
            <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: 'rgba(248,113,113,0.5)' }}>Hatalar</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-[11px]" style={{ color: '#f87171' }}>• {e}</p>
              ))}
            </div>
          )}
          {result.added > 0 && (
            <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <a href="/profil" className="text-[12px] font-semibold" style={{ color: '#D4A843' }}>
                Profilini görüntüle →
              </a>
            </div>
          )}
        </div>
      )}

      <button onClick={handleImport} disabled={!file || loading}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #be1a3e 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(225,29,72,0.25)' }}>
        {loading ? 'İçe Aktarılıyor...' : '📥 İçe Aktar'}
      </button>
    </div>
  )
}
