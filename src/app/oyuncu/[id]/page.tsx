import { notFound } from 'next/navigation'
import { IconCalendarDays, IconMapPin } from '@/components/icons'
import { getPersonDetail, getPersonCredits, getProfileUrl, getPersonExternalIds, getPersonImages } from '@/lib/tmdb'
import FilmografiClient from './FilmografiClient'
import KunyeClient from './KunyeClient'
import type { Metadata } from 'next'
import type { TMDbPersonCredit } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const person = await getPersonDetail(Number(id))
    const description = person.biography?.slice(0, 155)
      ?? `${person.name} filmleri, biyografisi ve haberleri Sinezon'da.`
    const ogImage = person.profile_path
      ? `https://image.tmdb.org/t/p/w342${person.profile_path}`
      : undefined
    return {
      title: person.name,
      description,
      alternates: { canonical: `/oyuncu/${id}` },
      openGraph: {
        title: `${person.name} | Sinezon`,
        description,
        images: ogImage ? [{ url: ogImage, width: 342, height: 513, alt: person.name }] : [],
        type: 'profile',
        url: `/oyuncu/${id}`,
      },
      twitter: {
        card: 'summary',
        title: `${person.name} | Sinezon`,
        description,
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch {
    return { title: 'Kişi bulunamadı' }
  }
}

export default async function OyuncuPage({ params }: Props) {
  const { id } = await params
  const personId = Number(id)

  const [person, credits, externalIds, personImages] = await Promise.all([
    getPersonDetail(personId).catch(() => null),
    getPersonCredits(personId).catch(() => ({ cast: [], crew: [] })),
    getPersonExternalIds(personId).catch(() => ({ imdb_id: null, instagram_id: null, twitter_id: null, wikidata_id: null })),
    getPersonImages(personId).catch(() => ({ profiles: [] })),
  ])

  if (!person) notFound()

  const profileUrl = getProfileUrl(person.profile_path, 'w342')

  const seenIds = new Set<string>()
  const castCredits: (TMDbPersonCredit & { role: string })[] = []
  const directorCredits: (TMDbPersonCredit & { role: string })[] = []
  const writerCredits: (TMDbPersonCredit & { role: string })[] = []

  for (const c of credits.cast) {
    const key = `${c.media_type}-${c.id}`
    if (!seenIds.has(key)) {
      seenIds.add(key)
      castCredits.push({ ...c, role: c.character ?? '' })
    }
  }
  for (const c of credits.crew) {
    const key2 = `${c.media_type}-${c.id}-${c.job}`
    if (!seenIds.has(key2)) {
      seenIds.add(key2)
      if (c.job === 'Director') directorCredits.push({ ...c, role: 'Yönetmen' })
      else if (c.job === 'Screenplay' || c.job === 'Writer' || c.job === 'Story') writerCredits.push({ ...c, role: c.job ?? 'Senaryo' })
    }
  }

  castCredits.sort((a, b) => b.vote_average - a.vote_average)
  directorCredits.sort((a, b) => b.vote_average - a.vote_average)

  const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null

  const knownForLabel: Record<string, string> = {
    Acting: 'Oyunculuk', Directing: 'Yönetmenlik', Writing: 'Senaristlik',
    Production: 'Yapımcılık', Crew: 'Ekip', Sound: 'Ses', 'Visual Effects': 'Görsel Efekt',
  }

  const popularFilms = castCredits.filter(c => c.media_type === 'movie').slice(0, 6)

  const allCreditsForStats = [...castCredits, ...directorCredits, ...writerCredits]
  const firstYear = allCreditsForStats
    .map(c => (c.release_date ?? c.first_air_date ?? '').slice(0, 4))
    .filter(y => y.length === 4)
    .sort()[0] ?? null
  const totalMovies = castCredits.filter(c => c.media_type === 'movie').length
    + directorCredits.filter(c => c.media_type === 'movie').length
  const totalTV = castCredits.filter(c => c.media_type === 'tv').length
    + directorCredits.filter(c => c.media_type === 'tv').length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Üst bölüm */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        <div className="shrink-0">
          <div className="w-44 rounded-xl overflow-hidden bg-[--bg-card] border border-[--border] shadow-xl shadow-black/40">
            {profileUrl ? (
              <img src={profileUrl} alt={person.name} className="w-full aspect-[2/3] object-cover" />
            ) : (
              <div className="w-full aspect-[2/3] flex items-center justify-center">
                <span className="text-5xl font-bold text-[--text-secondary] opacity-20">{person.name[0]}</span>
              </div>
            )}
          </div>
          {popularFilms.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-[--text-secondary] mb-2">Bilinen Filmler</p>
              <div className="grid grid-cols-3 gap-1">
                {popularFilms.map(c => (
                  <a key={c.id} href={`/film/${c.id}`} className="group">
                    <div className="aspect-[2/3] rounded overflow-hidden bg-[--bg-card] border border-[--border] group-hover:border-[--accent]/50 transition-colors">
                      {c.poster_path
                        ? <img src={`https://image.tmdb.org/t/p/w92${c.poster_path}`} alt={c.title ?? ''} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-[--bg-secondary]" />
                      }
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bilgiler */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{person.name}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {person.known_for_department && (
              <span className="px-3 py-1 rounded-full bg-[--accent]/20 text-[--accent] text-sm font-medium">
                {knownForLabel[person.known_for_department] ?? person.known_for_department}
              </span>
            )}
            {castCredits.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[--bg-card] border border-[--border] text-[--text-secondary] text-xs">
                {castCredits.length} yapım
              </span>
            )}
            {directorCredits.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[--bg-card] border border-[--border] text-[--text-secondary] text-xs">
                {directorCredits.length} yönetmenlik
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm text-[--text-secondary] mb-5">
            {person.birthday && (
              <div className="flex items-center gap-2">
                <IconCalendarDays className="h-4 w-4 shrink-0" />
                <span>
                  {formatDate(person.birthday)}
                  {age !== null && !person.deathday && ` (${age} yaşında)`}
                  {person.deathday && ` — ${formatDate(person.deathday)} (${age} yaşında)`}
                </span>
              </div>
            )}
            {person.place_of_birth && (
              <div className="flex items-center gap-2">
                <IconMapPin className="h-4 w-4 shrink-0" />
                <span>{person.place_of_birth}</span>
              </div>
            )}
            {person.also_known_as && person.also_known_as.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="text-xs text-[--text-secondary]/70 shrink-0">Diğer adları:</span>
                {person.also_known_as.slice(0, 4).map(n => (
                  <span key={n} className="text-xs px-2 py-0.5 rounded bg-[--bg-card] border border-[--border] text-[--text-secondary]">{n}</span>
                ))}
              </div>
            )}
          </div>

          {/* Dış linkler */}
          <div className="flex flex-wrap gap-2 mb-5">
            {externalIds.imdb_id && (
              <a href={`https://www.imdb.com/name/${externalIds.imdb_id}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] bg-[--bg-card] text-xs text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors">
                <span className="font-bold text-[--gold]">IMDb</span> Profil
              </a>
            )}
            {externalIds.imdb_id && (
              <a href={`https://www.imdb.com/name/${externalIds.imdb_id}/awards`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] bg-[--bg-card] text-xs text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors">
                🏆 IMDb Ödülleri
              </a>
            )}
            {externalIds.instagram_id && (
              <a href={`https://www.instagram.com/${externalIds.instagram_id}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] bg-[--bg-card] text-xs text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors">
                📷 Instagram
              </a>
            )}
          </div>

          {person.biography && (
            <div>
              <h3 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-wider mb-2">Biyografi</h3>
              <p className="text-sm text-[--text-secondary] leading-relaxed line-clamp-5">{person.biography}</p>
              {person.biography.length > 400 && (
                <details className="mt-1">
                  <summary className="text-xs text-[--accent] cursor-pointer hover:underline list-none">Tümünü oku</summary>
                  <p className="text-sm text-[--text-secondary] leading-relaxed mt-2">{person.biography}</p>
                </details>
              )}
            </div>
          )}

          {/* Fotoğraf Galerisi */}
          {personImages.profiles.length > 1 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-wider mb-2">Fotoğraflar</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {personImages.profiles.slice(0, 10).map((img, i) => (
                  <a key={i} href={`https://image.tmdb.org/t/p/w780${img.file_path}`} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 w-20 rounded-lg overflow-hidden bg-[--bg-card] border border-[--border] hover:border-[--accent]/50 transition-colors">
                    <img src={`https://image.tmdb.org/t/p/w185${img.file_path}`} alt="" className="w-full aspect-[2/3] object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sekmeli alt bölüm: Filmografi / Künye / Ödüller */}
      <KunyeClient
        castCredits={castCredits}
        directorCredits={directorCredits}
        writerCredits={writerCredits}
        biography={person.biography ?? ''}
        birthday={person.birthday}
        deathday={person.deathday}
        placeOfBirth={person.place_of_birth}
        alsoKnownAs={person.also_known_as ?? []}
        knownForDepartment={person.known_for_department}
        firstYear={firstYear}
        totalMovies={totalMovies}
        totalTV={totalTV}
        imdbId={externalIds.imdb_id}
        knownForLabel={knownForLabel}
      />
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function calculateAge(birthday: string, deathday: string | null): number {
  const birth = new Date(birthday)
  const end = deathday ? new Date(deathday) : new Date()
  return Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}
