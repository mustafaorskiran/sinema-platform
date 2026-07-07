import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPosterUrl } from '@/lib/tmdb'

export const revalidate = 600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const limit = Math.min(6, Math.max(3, Number(req.nextUrl.searchParams.get('limit') || '5')))

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio')
    .eq('username', username)
    .single()

  if (!profile) return new NextResponse('Not Found', { status: 404 })

  const [{ data: recent }, { data: reviews }, { count: filmCount }, { count: diziCount }] = await Promise.all([
    supabase.from('watchlist')
      .select('media_id, media_type')
      .eq('user_id', profile.id).eq('status', 'izledim')
      .order('created_at', { ascending: false }).limit(limit),
    supabase.from('reviews').select('rating').eq('user_id', profile.id),
    supabase.from('watchlist').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('status', 'izledim').eq('media_type', 'film'),
    supabase.from('watchlist').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('status', 'izledim').eq('media_type', 'dizi'),
  ])

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const filmIds = (recent ?? []).filter(m => m.media_type === 'film').map(m => m.media_id)
  const diziIds = (recent ?? []).filter(m => m.media_type === 'dizi').map(m => m.media_id)

  const [{ data: localFilms }, { data: localSeries }] = await Promise.all([
    filmIds.length > 0 ? supabase.from('movies').select('tmdb_id, title, poster_path').in('tmdb_id', filmIds) : Promise.resolve({ data: [] }),
    diziIds.length > 0 ? supabase.from('series').select('tmdb_id, name, poster_path').in('tmdb_id', diziIds) : Promise.resolve({ data: [] }),
  ])

  const posterCache = new Map<string, { title: string; poster: string | null }>()
  for (const f of localFilms ?? []) posterCache.set(`film-${f.tmdb_id}`, { title: f.title, poster: getPosterUrl(f.poster_path, 'w342') })
  for (const s of localSeries ?? []) posterCache.set(`dizi-${s.tmdb_id}`, { title: s.name, poster: getPosterUrl(s.poster_path, 'w342') })

  const total = (filmCount ?? 0) + (diziCount ?? 0)
  const avatarStyle = 'width:36px;height:36px;border-radius:50%;overflow:hidden;background:#E11D48;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;border:2px solid rgba(255,255,255,0.08)'

  const postersHtml = (recent ?? []).map(w => {
    const info = posterCache.get(`${w.media_type}-${w.media_id}`)
    const safeTitle = escapeHtml(info?.title ?? '')
    const posterImg = info?.poster ? `<img src="${escapeHtml(info.poster)}" alt="${safeTitle}" style="width:100%;height:100%;object-fit:cover;display:block">` : ''
    return `<a href="${SITE_URL}/${encodeURIComponent(w.media_type)}/${encodeURIComponent(String(w.media_id))}" target="_blank" rel="noopener noreferrer" title="${safeTitle}" style="flex:1;border-radius:6px;overflow:hidden;aspect-ratio:2/3;background:rgba(255,255,255,0.04);display:block">${posterImg}</a>`
  }).join('')

  const statsHtml = [
    { v: total, l: 'İzlendi' },
    { v: filmCount ?? 0, l: 'Film' },
    { v: diziCount ?? 0, l: 'Dizi' },
    ...(avgRating ? [{ v: `★ ${avgRating}`, l: 'Ort.' }] : []),
  ].map(s => `<div style="flex:1;text-align:center;padding:6px 4px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)"><p style="font-size:13px;font-weight:800;color:#fff;line-height:1">${s.v}</p><p style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:2px">${s.l}</p></div>`).join('')

  const safeUsername = escapeHtml(username)
  const avatarContent = profile.avatar_url
    ? `<img src="${escapeHtml(profile.avatar_url)}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : escapeHtml(profile.username[0].toUpperCase())

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>@${safeUsername} — Sinezon</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:linear-gradient(160deg,rgba(10,15,28,.99),rgba(8,12,22,1));min-height:100vh;display:flex;align-items:center;justify-content:center;padding:12px}a{text-decoration:none;color:inherit}</style>
</head>
<body>
<div style="width:100%;max-width:300px;border-radius:16px;padding:16px;background:linear-gradient(160deg,rgba(20,28,47,.95),rgba(14,20,32,.98));border:1px solid rgba(212,168,67,.12);box-shadow:0 20px 60px rgba(0,0,0,.6)">

  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
    <div style="${avatarStyle}">${avatarContent}</div>
    <div style="flex:1;min-width:0">
      <a href="${SITE_URL}/profil/${encodeURIComponent(username)}" target="_blank">
        <p style="font-size:13px;font-weight:700;color:#fff;line-height:1.2">@${safeUsername}</p>
      </a>
      ${profile.bio ? `<p style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:2px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${escapeHtml(profile.bio)}</p>` : ''}
    </div>
    <a href="${SITE_URL}" target="_blank" style="font-size:11px;font-weight:900;flex-shrink:0">
      <span style="color:#E11D48">Sine</span><span style="color:rgba(212,168,67,.8)">zon</span>
    </a>
  </div>

  <div style="display:flex;gap:6px;margin-bottom:12px">${statsHtml}</div>

  ${(recent ?? []).length > 0 ? `
  <div>
    <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,.2);margin-bottom:7px">Son İzlenenler</p>
    <div style="display:flex;gap:5px">${postersHtml}</div>
  </div>` : ''}

  <p style="text-align:center;font-size:9px;color:rgba(255,255,255,.12);margin-top:10px">sinezon.com</p>
</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      'X-Frame-Options': 'ALLOWALL',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
