import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getPersonDetail, getPersonCredits, getProfileUrl, getPosterUrl } from '@/lib/tmdb'

/// Mobil uygulama için oyuncu/yönetmen detay uç noktası — film/[id],
/// dizi/[id] route'larıyla aynı desen.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-kisi-detail:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const { id } = await params
  const personId = Number(id)
  if (!Number.isFinite(personId)) {
    return NextResponse.json({ error: 'Geçersiz id' }, { status: 400 })
  }

  try {
    const [person, credits] = await Promise.all([
      getPersonDetail(personId),
      getPersonCredits(personId).catch(() => null),
    ])

    const knownFor = (credits?.cast ?? [])
      .filter((c: any) => (c.popularity ?? 0) > 0)
      .sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, 20)
      .map((c: any) => ({
        id: c.id,
        mediaType: c.media_type === 'tv' ? 'dizi' : 'film',
        title: c.title ?? c.name ?? '',
        character: c.character ?? null,
        poster: getPosterUrl(c.poster_path, 'w342'),
        year: (c.release_date ?? c.first_air_date ?? '').slice(0, 4) || null,
      }))

    const directorFilmography = (credits?.crew ?? [])
      .filter((c: any) => c.job === 'Director')
      .sort((a: any, b: any) => (b.release_date ?? b.first_air_date ?? '').localeCompare(a.release_date ?? a.first_air_date ?? ''))
      .slice(0, 30)
      .map((c: any) => ({
        id: c.id,
        mediaType: c.media_type === 'tv' ? 'dizi' : 'film',
        title: c.title ?? c.name ?? '',
        poster: getPosterUrl(c.poster_path, 'w342'),
        year: (c.release_date ?? c.first_air_date ?? '').slice(0, 4) || null,
      }))

    return NextResponse.json({
      id: person.id,
      name: person.name,
      biography: person.biography || null,
      birthday: person.birthday || null,
      deathday: person.deathday || null,
      placeOfBirth: person.place_of_birth || null,
      knownForDepartment: person.known_for_department || null,
      profile: getProfileUrl(person.profile_path, 'h632'),
      knownFor,
      directorFilmography,
    })
  } catch {
    return NextResponse.json({ error: 'Kişi bulunamadı' }, { status: 404 })
  }
}
