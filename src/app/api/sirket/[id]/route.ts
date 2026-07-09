import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getCompanyDetail, getCompanyMovies, getCompanyTV, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'

/// Mobil için /sirket/[id] sayfasının aynısı.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-sirket:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const { id } = await params
  const companyId = Number(id)
  if (!companyId) return NextResponse.json({ error: 'Geçersiz şirket' }, { status: 400 })

  try {
    const [company, moviesData, tvData] = await Promise.all([
      getCompanyDetail(companyId).catch(() => null),
      getCompanyMovies(companyId, 1).catch(() => ({ results: [], total_results: 0 })),
      getCompanyTV(companyId, 1).catch(() => ({ results: [], total_results: 0 })),
    ])
    if (!company) return NextResponse.json({ error: 'Şirket bulunamadı' }, { status: 404 })

    function mapList(results: typeof moviesData.results, mediaType: 'film' | 'dizi') {
      return results.slice(0, 18).map(m => ({
        id: m.id, mediaType,
        title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342'),
        year: getMediaYear(m), rating: m.vote_average ?? null,
      }))
    }

    return NextResponse.json({
      id: company.id,
      name: company.name,
      description: company.description || null,
      headquarters: company.headquarters || null,
      homepage: company.homepage || null,
      logo: company.logo_path ? getPosterUrl(company.logo_path, 'w342') : null,
      originCountry: company.origin_country || null,
      parentCompany: company.parent_company ? { id: company.parent_company.id, name: company.parent_company.name } : null,
      movies: mapList(moviesData.results ?? [], 'film'),
      movieCount: moviesData.total_results ?? 0,
      series: mapList(tvData.results ?? [], 'dizi'),
      seriesCount: tvData.total_results ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Şirket bulunamadı' }, { status: 404 })
  }
}
