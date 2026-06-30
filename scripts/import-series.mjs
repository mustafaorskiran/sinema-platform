/**
 * TMDb Dizi Import Scripti
 * Kullanım: node scripts/import-series.mjs
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

function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local')
  if (!existsSync(envPath)) { console.error('.env.local bulunamadı'); process.exit(1) }
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv()

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SVC_KEY = process.env.SUPABASE_SERVICE_KEY
const TMDB_TOKEN       = process.env.TMDB_API_KEY ?? process.env.TMDB_API_TOKEN
const MIN_POPULARITY   = 0.1      // 0.5→0.1: daha fazla dizi
const CONCURRENCY      = 35
const INSERT_BATCH     = 500
const CACHE_DIR        = resolve(__dirname, '.cache')
const PROGRESS_FILE    = resolve(CACHE_DIR, 'progress-series.json')

if (!SUPABASE_URL || !SUPABASE_SVC_KEY || !TMDB_TOKEN) {
  console.error('Eksik env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, TMDB_API_KEY')
  process.exit(1)
}

mkdirSync(CACHE_DIR, { recursive: true })
const supabase = createClient(SUPABASE_URL, SUPABASE_SVC_KEY)

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
      if (res.statusCode !== 200) { file.close(); return reject(new Error(`HTTP ${res.statusCode}`)) }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', err => { file.close(); reject(err) })
  })
}

async function getExportPath() {
  for (const ago of [1, 2, 3]) {
    const date = exportDate(ago)
    const fname = `tv_series_ids_${date}.json.gz`
    const localPath = resolve(CACHE_DIR, fname)
    if (existsSync(localPath)) { console.log(`✓ Export cache: ${fname}`); return localPath }
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
      if (!m.adult && m.popularity >= MIN_POPULARITY) ids.push({ id: m.id, pop: m.popularity })
    } catch {}
  }
  ids.sort((a, b) => b.pop - a.pop)
  console.log(`✓ ${ids.length.toLocaleString()} dizi (popularity ≥ ${MIN_POPULARITY})`)
  return ids.map(m => m.id)
}

class Semaphore {
  constructor(max) { this.max = max; this.cnt = 0; this.q = [] }
  acquire() {
    if (this.cnt < this.max) { this.cnt++; return Promise.resolve() }
    return new Promise(r => this.q.push(r)).then(() => { this.cnt++ })
  }
  release() { this.cnt--; this.q.shift()?.() }
}

async function fetchSeries(id, attempt = 0) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${id}?language=tr-TR`,
      { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
    )
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
      return attempt < 4 ? fetchSeries(id, attempt + 1) : null
    }
    if (!res.ok) return null
    return res.json()
  } catch {
    if (attempt < 2) { await new Promise(r => setTimeout(r, 1000)); return fetchSeries(id, attempt + 1) }
    return null
  }
}

function toRecord(s) {
  if (!s || !s.name) return null
  return {
    tmdb_id:         s.id,
    name:            s.name,
    original_name:   s.original_name   || null,
    overview:        s.overview        || null,
    poster_path:     s.poster_path     || null,
    backdrop_path:   s.backdrop_path   || null,
    first_air_date:  s.first_air_date  || null,
    first_air_year:  s.first_air_date  ? (parseInt(s.first_air_date) || null) : null,
    vote_average:    s.vote_average    ?? 0,
    vote_count:      s.vote_count      ?? 0,
    popularity:      s.popularity      ?? 0,
    genre_ids:       (s.genres         ?? []).map(g => g.id),
    original_language: s.original_language || null,
  }
}

async function main() {
  let startFrom    = 0
  let totalWritten = 0

  if (existsSync(PROGRESS_FILE)) {
    const p = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'))
    startFrom    = p.lastIndex    ?? 0
    totalWritten = p.totalWritten ?? 0
    console.log(`↩  Kaldığı yerden devam: index ${startFrom.toLocaleString()} (${totalWritten.toLocaleString()} kayıt)`)
  }

  const exportPath = await getExportPath()
  const allIds     = await parseExport(exportPath)
  const workIds    = allIds.slice(startFrom)

  console.log(`\n🚀 ${workIds.length.toLocaleString()} dizi işlenecek — ${CONCURRENCY} eş zamanlı istek`)
  console.log('─'.repeat(64))

  const sem     = new Semaphore(CONCURRENCY)
  let pending   = []
  let processed = 0
  const t0      = Date.now()

  async function flush(force = false) {
    if (pending.length === 0) return
    if (!force && pending.length < INSERT_BATCH) return
    const batch = pending.splice(0, INSERT_BATCH)
    const { error } = await supabase.from('series').upsert(batch, { onConflict: 'tmdb_id' })
    if (error) console.error('  ⚠ Supabase hata:', error.message)
    else totalWritten += batch.length
  }

  function saveProgress() {
    writeFileSync(PROGRESS_FILE, JSON.stringify({ lastIndex: startFrom + processed, totalWritten }))
  }

  const tasks = workIds.map(id => async () => {
    await sem.acquire()
    try {
      const s   = await fetchSeries(id)
      const rec = toRecord(s)
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
          `  (${pct}%)  DB: ${totalWritten.toLocaleString()}` +
          `  ${Math.round(rate)} dizi/s  ETA ~${etaMin} dk`
        )
        saveProgress()
      }
    } finally {
      sem.release()
    }
  })

  await Promise.all(tasks.map(t => t()))
  await flush(true)
  saveProgress()

  const elapsed = Math.round((Date.now() - t0) / 60000)
  console.log('\n' + '═'.repeat(64))
  console.log(`✅  Tamamlandı!`)
  console.log(`    Toplam yazılan : ${totalWritten.toLocaleString()} dizi`)
  console.log(`    Süre           : ${elapsed} dakika`)
}

main().catch(err => { console.error(err); process.exit(1) })
