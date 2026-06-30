/**
 * TMDb Film Import Scripti
 * Kullanım: node scripts/import-movies.mjs
 *
 * Gerekli env değişkenleri (.env.local'dan okur):
 *   TMDB_API_TOKEN        - TMDb Bearer token
 *   SUPABASE_SERVICE_KEY  - Supabase service_role key (admin)
 *   NEXT_PUBLIC_SUPABASE_URL
 */

import { createReadStream, createWriteStream, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { createGunzip } from 'zlib'
import { get as httpsGet } from 'https'
import { get as httpGet }  from 'http'
import readline from 'readline'
import { createClient } from '@supabase/supabase-js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── .env.local oku ─────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local')
  if (!existsSync(envPath)) { console.error('.env.local bulunamadı'); process.exit(1) }
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv()

// ─── Ayarlar ────────────────────────────────────────────────
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SVC_KEY  = process.env.SUPABASE_SERVICE_KEY
const TMDB_TOKEN        = process.env.TMDB_API_KEY ?? process.env.TMDB_API_TOKEN
const MIN_POPULARITY    = 0.1      // filtre eşiği (0.5→0.1: daha fazla film)
const CONCURRENCY       = 35       // eş zamanlı TMDb isteği
const INSERT_BATCH      = 500      // Supabase'e tek seferde yazılacak kayıt
const CACHE_DIR         = resolve(__dirname, '.cache')
const PROGRESS_FILE     = resolve(CACHE_DIR, 'progress.json')

if (!SUPABASE_URL || !SUPABASE_SVC_KEY || !TMDB_TOKEN) {
  console.error('Eksik env değişkeni:')
  if (!SUPABASE_URL)     console.error('  NEXT_PUBLIC_SUPABASE_URL')
  if (!SUPABASE_SVC_KEY) console.error('  SUPABASE_SERVICE_KEY  (Supabase → Project Settings → API → service_role)')
  if (!TMDB_TOKEN)       console.error('  TMDB_API_KEY')
  process.exit(1)
}

mkdirSync(CACHE_DIR, { recursive: true })

const supabase = createClient(SUPABASE_URL, SUPABASE_SVC_KEY)

// ─── Yardımcılar ────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0') }

function exportDate(daysAgo = 1) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${pad(d.getMonth() + 1)}_${pad(d.getDate())}_${d.getFullYear()}`
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith('https') ? httpsGet : httpGet
    const file = createWriteStream(dest)
    getter(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close()
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`))
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', err => { file.close(); reject(err) })
  })
}

async function getExportPath() {
  for (const ago of [1, 2, 3]) {
    const date = exportDate(ago)
    const fname = `movie_ids_${date}.json.gz`
    const localPath = resolve(CACHE_DIR, fname)
    if (existsSync(localPath)) {
      console.log(`✓ Export cache: ${fname}`)
      return localPath
    }
    const url = `http://files.tmdb.org/p/exports/${fname}`
    console.log(`⬇  İndiriliyor: ${fname}`)
    try {
      await download(url, localPath)
      console.log(`✓ İndirildi: ${fname}`)
      return localPath
    } catch (e) {
      console.warn(`  ${e.message} — ${ago + 1} gün önceki deneniyor...`)
    }
  }
  throw new Error('Export dosyası indirilemedi.')
}

async function parseExport(filePath) {
  console.log('📂 Export ayrıştırılıyor...')
  const ids = []
  const rl = readline.createInterface({
    input: createReadStream(filePath).pipe(createGunzip()),
    crlfDelay: Infinity,
  })
  for await (const line of rl) {
    if (!line.trim()) continue
    try {
      const m = JSON.parse(line)
      if (!m.adult && m.popularity >= MIN_POPULARITY) {
        ids.push({ id: m.id, pop: m.popularity })
      }
    } catch {}
  }
  ids.sort((a, b) => b.pop - a.pop)
  console.log(`✓ ${ids.length.toLocaleString()} film (popularity ≥ ${MIN_POPULARITY})`)
  return ids.map(m => m.id)
}

// Semaphore — eş zamanlı istek sınırlayıcı
class Semaphore {
  constructor(max) { this.max = max; this.cnt = 0; this.q = [] }
  acquire() {
    if (this.cnt < this.max) { this.cnt++; return Promise.resolve() }
    return new Promise(r => this.q.push(r)).then(() => { this.cnt++ })
  }
  release() { this.cnt--; this.q.shift()?.() }
}

async function fetchMovie(id, attempt = 0) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?language=tr-TR`,
      { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
    )
    if (res.status === 429) {
      const wait = 2000 * (attempt + 1)
      await new Promise(r => setTimeout(r, wait))
      return attempt < 4 ? fetchMovie(id, attempt + 1) : null
    }
    if (!res.ok) return null
    return res.json()
  } catch {
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 1000))
      return fetchMovie(id, attempt + 1)
    }
    return null
  }
}

function toRecord(m) {
  if (!m || m.adult || !m.title) return null
  return {
    tmdb_id:        m.id,
    title:          m.title,
    original_title: m.original_title || null,
    overview:       m.overview       || null,
    poster_path:    m.poster_path    || null,
    backdrop_path:  m.backdrop_path  || null,
    release_date:   m.release_date   || null,
    release_year:   m.release_date   ? (parseInt(m.release_date) || null) : null,
    vote_average:   m.vote_average   ?? 0,
    vote_count:     m.vote_count     ?? 0,
    popularity:     m.popularity     ?? 0,
    genre_ids:      (m.genres        ?? []).map(g => g.id),
    original_language: m.original_language || null,
  }
}

// ─── Ana fonksiyon ──────────────────────────────────────────
async function main() {
  let startFrom    = 0
  let totalWritten = 0

  if (existsSync(PROGRESS_FILE)) {
    const p = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'))
    startFrom    = p.lastIndex    ?? 0
    totalWritten = p.totalWritten ?? 0
    console.log(`↩  Kaldığı yerden devam: index ${startFrom.toLocaleString()} (${totalWritten.toLocaleString()} kayıt eklendi)`)
  }

  const exportPath = await getExportPath()
  const allIds     = await parseExport(exportPath)
  const workIds    = allIds.slice(startFrom)

  console.log(`\n🚀 ${workIds.length.toLocaleString()} film işlenecek — ${CONCURRENCY} eş zamanlı istek`)
  console.log('─'.repeat(64))

  const sem        = new Semaphore(CONCURRENCY)
  let pending      = []   // Supabase'e yazılmayı bekleyenler
  let processed    = 0
  const t0         = Date.now()

  async function flush(force = false) {
    if (pending.length === 0) return
    if (!force && pending.length < INSERT_BATCH) return
    const batch = pending.splice(0, INSERT_BATCH)
    const { error } = await supabase.from('movies').upsert(batch, { onConflict: 'tmdb_id' })
    if (error) console.error('  ⚠ Supabase hata:', error.message)
    else totalWritten += batch.length
  }

  function saveProgress() {
    writeFileSync(PROGRESS_FILE, JSON.stringify({ lastIndex: startFrom + processed, totalWritten }))
  }

  const tasks = workIds.map((id, localIdx) => async () => {
    await sem.acquire()
    try {
      const movie = await fetchMovie(id)
      const rec   = toRecord(movie)
      if (rec) pending.push(rec)

      processed++
      await flush()

      if (processed % 1000 === 0) {
        const elapsedS = (Date.now() - t0) / 1000
        const rate     = processed / elapsedS
        const left     = workIds.length - processed
        const etaMin   = Math.round(left / rate / 60)
        const pct      = ((startFrom + processed) / allIds.length * 100).toFixed(1)

        console.log(
          `[${new Date().toLocaleTimeString()}]` +
          `  ${(startFrom + processed).toLocaleString().padStart(7)} / ${allIds.length.toLocaleString()}` +
          `  (${pct}%)` +
          `  DB: ${totalWritten.toLocaleString()}` +
          `  ${Math.round(rate)} film/s` +
          `  ETA ~${etaMin} dk`
        )
        saveProgress()
      }
    } finally {
      sem.release()
    }
  })

  // Hepsini başlat (semaphore eş zamanlılığı sınırlar)
  await Promise.all(tasks.map(t => t()))

  await flush(true)
  saveProgress()

  const elapsed = Math.round((Date.now() - t0) / 60000)
  console.log('\n' + '═'.repeat(64))
  console.log(`✅  Tamamlandı!`)
  console.log(`    Toplam yazılan : ${totalWritten.toLocaleString()} film`)
  console.log(`    Süre           : ${elapsed} dakika`)
  console.log(`    Ortalama hız   : ${Math.round(processed / ((Date.now() - t0) / 1000))} film/s`)
}

main().catch(err => { console.error(err); process.exit(1) })
