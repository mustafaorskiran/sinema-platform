import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const revalidate = 86400

// Tür slug'ları — /tur/[slug] canonical sayfaları
const GENRE_SLUGS = [
  'aksiyon','macera','animasyon','komedi','suc','belgesel','drama',
  'aile','fantezi','tarih','korku','muzik','gizem','romantik',
  'bilim-kurgu','gerilim','savas','vahsi-bati',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Statik sayfalar ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                   lastModified: now, priority: 1.0, changeFrequency: 'daily'   },
    { url: `${BASE}/filmler`,            lastModified: now, priority: 0.9, changeFrequency: 'daily'   },
    { url: `${BASE}/diziler`,            lastModified: now, priority: 0.9, changeFrequency: 'daily'   },
    { url: `${BASE}/listeler`,           lastModified: now, priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${BASE}/fragmanlar`,         lastModified: now, priority: 0.7, changeFrequency: 'daily'   },
    { url: `${BASE}/en-cok-yorumlanan`,  lastModified: now, priority: 0.7, changeFrequency: 'daily'   },
    { url: `${BASE}/tur`,                lastModified: now, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/ozel-listeler`,      lastModified: now, priority: 0.7, changeFrequency: 'weekly'  },
    { url: `${BASE}/ruh-hali`,           lastModified: now, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/ne-izlesem`,         lastModified: now, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/yayin-takvimi`,      lastModified: now, priority: 0.6, changeFrequency: 'daily'   },
    { url: `${BASE}/forum`,              lastModified: now, priority: 0.6, changeFrequency: 'daily'   },
    { url: `${BASE}/kullanicilar`,       lastModified: now, priority: 0.5, changeFrequency: 'weekly'  },
    { url: `${BASE}/karsilastir`,        lastModified: now, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE}/arama`,              lastModified: now, priority: 0.5, changeFrequency: 'monthly' },
  ]

  // ── Tür sayfaları (/tur/[slug] — canonical URL) ───────────────────────────────
  const genrePages: MetadataRoute.Sitemap = GENRE_SLUGS.map(slug => ({
    url: `${BASE}/tur/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // ── Dinamik film & dizi sayfaları (Supabase REST API) ────────────────────────
  let moviePages: MetadataRoute.Sitemap = []
  let seriesPages: MetadataRoute.Sitemap = []

  try {
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    }
    const [moviesRes, seriesRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/movies?select=tmdb_id&order=popularity.desc&limit=10000`,
        { headers, next: { revalidate: 86400 } }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/series?select=tmdb_id&order=popularity.desc&limit=10000`,
        { headers, next: { revalidate: 86400 } }
      ),
    ])

    if (moviesRes.ok) {
      const movies: { tmdb_id: number }[] = await moviesRes.json()
      moviePages = movies.map(m => ({
        url: `${BASE}/film/${m.tmdb_id}`,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    }

    if (seriesRes.ok) {
      const series: { tmdb_id: number }[] = await seriesRes.json()
      seriesPages = series.map(s => ({
        url: `${BASE}/dizi/${s.tmdb_id}`,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    }
  } catch {
    // Supabase erişilemezse statik + tür sayfalarıyla devam et
  }

  // ── Public listeler + profiller + forum + koleksiyonlar + editorial ───────
  let listPages: MetadataRoute.Sitemap = []
  let profilePages: MetadataRoute.Sitemap = []
  let forumPages: MetadataRoute.Sitemap = []
  let collectionPages: MetadataRoute.Sitemap = []
  let editorialPages: MetadataRoute.Sitemap = []

  try {
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    }

    const [listsRes, profilesRes, threadsRes, collectionsRes, editorialRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/lists?select=id,updated_at&public=eq.true&order=updated_at.desc&limit=5000`, { headers, next: { revalidate: 86400 } }),
      fetch(`${SUPABASE_URL}/rest/v1/profiles?select=username,updated_at&username=not.is.null&order=updated_at.desc&limit=10000`, { headers, next: { revalidate: 86400 } }),
      fetch(`${SUPABASE_URL}/rest/v1/forum_threads?select=id,updated_at&order=updated_at.desc&limit=5000`, { headers, next: { revalidate: 86400 } }),
      fetch(`${SUPABASE_URL}/rest/v1/collection?select=user_id,updated_at&order=updated_at.desc&limit=1000`, { headers, next: { revalidate: 86400 } }),
      fetch(`${SUPABASE_URL}/rest/v1/lists?select=slug,updated_at&user_id=is.null&slug=not.is.null`, { headers, next: { revalidate: 86400 } }),
    ])

    if (listsRes.ok) {
      const lists: { id: string; updated_at: string }[] = await listsRes.json()
      listPages = lists.map(l => ({ url: `${BASE}/liste/${l.id}`, lastModified: new Date(l.updated_at), changeFrequency: 'weekly' as const, priority: 0.6 }))
    }
    if (profilesRes.ok) {
      const profiles: { username: string; updated_at: string }[] = await profilesRes.json()
      profilePages = profiles.map(p => ({ url: `${BASE}/profil/${p.username}`, lastModified: new Date(p.updated_at), changeFrequency: 'weekly' as const, priority: 0.7 }))
    }
    if (threadsRes.ok) {
      const threads: { id: string; updated_at: string }[] = await threadsRes.json()
      forumPages = threads.map(t => ({ url: `${BASE}/forum/${t.id}`, lastModified: new Date(t.updated_at), changeFrequency: 'daily' as const, priority: 0.5 }))
    }
    if (collectionsRes.ok) {
      const cols: { user_id: string }[] = await collectionsRes.json()
      const uniqueUserIds = [...new Set(cols.map(c => c.user_id))]
      collectionPages = uniqueUserIds.map(uid => ({ url: `${BASE}/koleksiyon/${uid}`, changeFrequency: 'monthly' as const, priority: 0.4 }))
    }
    if (editorialRes.ok) {
      const editorial: { slug: string; updated_at: string }[] = await editorialRes.json()
      editorialPages = editorial.map(e => ({ url: `${BASE}/liste/editorial/${e.slug}`, lastModified: new Date(e.updated_at), changeFrequency: 'weekly' as const, priority: 0.8 }))
    }
  } catch {}

  return [...staticPages, ...genrePages, ...moviePages, ...seriesPages, ...listPages, ...profilePages, ...forumPages, ...collectionPages, ...editorialPages]
}
