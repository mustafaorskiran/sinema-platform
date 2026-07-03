import { notFound } from 'next/navigation'
import Image from 'next/image'
import { IconCalendarDays, IconMapPin, IconStarFilled } from '@/components/icons'
import { getPersonDetail, getPersonCredits, getProfileUrl, getPersonExternalIds, getPersonImages } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import FilmografiClient from './FilmografiClient'
import KunyeClient from './KunyeClient'
import type { Metadata } from 'next'
import type { TMDbPersonCredit } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { t } = await getTranslations()
  try {
    const person = await getPersonDetail(Number(id))
    const description = person.biography?.slice(0, 155)
      ?? t('person.metaDescriptionFallback', { name: person.name })
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
    }
  } catch {
    return { title: t('person.notFound') }
  }
}

export default async function OyuncuPage({ params }: Props) {
  const { id } = await params
  const { t } = await getTranslations()
  const personId = Number(id)

  const [person, credits, externalIds, personImages] = await Promise.all([
    getPersonDetail(personId).catch(() => null),
    getPersonCredits(personId).catch(() => ({ cast: [], crew: [] })),
    getPersonExternalIds(personId).catch(() => ({ imdb_id: null, instagram_id: null, twitter_id: null, wikidata_id: null })),
    getPersonImages(personId).catch(() => ({ profiles: [] })),
  ])

  if (!person) notFound()

  const profileUrl = getProfileUrl(person.profile_path, 'w342')
  const profileUrlLarge = person.profile_path ? `https://image.tmdb.org/t/p/h632${person.profile_path}` : null

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
      if (c.job === 'Director') directorCredits.push({ ...c, role: t('film.director') })
      else if (c.job === 'Screenplay' || c.job === 'Writer' || c.job === 'Story') writerCredits.push({ ...c, role: c.job ?? t('person.screenplay') })
    }
  }

  castCredits.sort((a, b) => b.vote_average - a.vote_average)
  directorCredits.sort((a, b) => b.vote_average - a.vote_average)

  const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null

  const knownForLabel: Record<string, string> = {
    Acting: t('person.deptActing'), Directing: t('person.deptDirecting'), Writing: t('person.deptWritingLong'),
    Production: t('person.deptProductionLong'), Crew: t('person.deptCrew'), Sound: t('person.deptSound'), 'Visual Effects': t('person.roleVisualEffects'),
  }

  const popularFilms = castCredits
    .filter(c => c.media_type === 'movie' && c.poster_path)
    .slice(0, 6)

  const allCreditsForStats = [...castCredits, ...directorCredits, ...writerCredits]
  const firstYear = allCreditsForStats
    .map(c => (c.release_date ?? c.first_air_date ?? '').slice(0, 4))
    .filter(y => y.length === 4)
    .sort()[0] ?? null
  const totalMovies = castCredits.filter(c => c.media_type === 'movie').length
    + directorCredits.filter(c => c.media_type === 'movie').length
  const totalTV = castCredits.filter(c => c.media_type === 'tv').length
    + directorCredits.filter(c => c.media_type === 'tv').length
  const careerYears = firstYear ? new Date().getFullYear() - Number(firstYear) : null

  const deptLabel = knownForLabel[person.known_for_department] ?? person.known_for_department

  return (
    <div className="min-h-screen">

      {/* ── HERO BACKDROP ── */}
      <div className="relative h-[340px] sm:h-[400px] overflow-hidden">
        {profileUrlLarge && (
          <>
            <Image
              src={profileUrlLarge}
              alt={person.name}
              fill
              sizes="100vw"
              className="object-cover object-top scale-110"
              style={{ filter: 'blur(24px)', opacity: 0.18 }}
              priority
            />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(8,10,15,0.3) 0%, rgba(8,10,15,0.7) 60%, var(--bg-primary) 100%)' }} />
          </>
        )}
        {!profileUrlLarge && (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0d1226 0%, #080a0f 100%)' }} />
        )}

        {/* Subtle gold grain overlay */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-56 relative z-10">

        {/* ── ÜSTTEN PROFIL KARTI ── */}
        <div className="flex flex-col sm:flex-row gap-7 mb-10">

          {/* Sol: Fotoğraf + filmler */}
          <div className="shrink-0 flex flex-col items-center sm:items-start">
            {/* Profile photo */}
            <div className="relative w-48 sm:w-56">
              <div
                className="absolute -inset-1 rounded-2xl opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--gold) 0%, var(--accent) 100%)', filter: 'blur(12px)' }}
              />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{ border: '2px solid rgba(212,168,67,0.3)' }}>
                {profileUrl ? (
                  <Image
                    src={profileUrl}
                    alt={person.name}
                    width={224}
                    height={336}
                    className="w-full aspect-[2/3] object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full aspect-[2/3] flex items-center justify-center"
                    style={{ background: 'var(--bg-card)' }}>
                    <span className="text-6xl font-black opacity-20" style={{ color: 'var(--gold)' }}>
                      {person.name[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bilinen Filmler */}
            {popularFilms.length > 0 && (
              <div className="mt-5 w-48 sm:w-56">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5"
                   style={{ color: 'rgba(212,168,67,0.5)' }}>
                  {t('person.knownFor')}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {popularFilms.map(c => (
                    <a key={`${c.media_type}-${c.id}`}
                       href={`/${c.media_type === 'movie' ? 'film' : 'dizi'}/${c.id}`}
                       className="group">
                      <div className="aspect-[2/3] rounded-lg overflow-hidden transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg"
                           style={{ border: '1px solid rgba(212,168,67,0.15)' }}>
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${c.poster_path}`}
                          alt={c.title ?? ''}
                          width={92}
                          height={138}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sağ: Tüm bilgiler */}
          <div className="flex-1 pt-2 sm:pt-20">

            {/* Departman rozeti */}
            <div className="flex items-center gap-2 mb-3">
              {deptLabel && (
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full"
                  style={{ background: 'rgba(225,29,72,0.15)', color: 'var(--accent)', border: '1px solid rgba(225,29,72,0.3)' }}>
                  {deptLabel}
                </span>
              )}
              {(castCredits.length + directorCredits.length) > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  {castCredits.length + directorCredits.length} {t('person.productionsSuffix')}
                </span>
              )}
            </div>

            {/* İsim */}
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-none"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              {person.name}
            </h1>

            {/* Meta bilgiler */}
            <div className="flex flex-col gap-2 mb-5">
              {person.birthday && (
                <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <IconCalendarDays className="h-4 w-4 shrink-0" style={{ color: 'rgba(212,168,67,0.6)' }} />
                  <span>
                    {formatDate(person.birthday)}
                    {age !== null && !person.deathday && (
                      <span className="ml-1.5 text-[12px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {t('person.yearsOldBadge', { age })}
                      </span>
                    )}
                    {person.deathday && ` — ${formatDate(person.deathday)}`}
                  </span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <IconMapPin className="h-4 w-4 shrink-0" style={{ color: 'rgba(212,168,67,0.6)' }} />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            {/* Diğer adlar */}
            {person.also_known_as && person.also_known_as.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-5">
                <span className="text-[11px] shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('person.otherNames')}</span>
                {person.also_known_as.slice(0, 5).map(n => (
                  <span key={n}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                    {n}
                  </span>
                ))}
              </div>
            )}

            {/* Dış linkler */}
            <div className="flex flex-wrap gap-2 mb-6">
              {externalIds.imdb_id && (
                <a href={`https://www.imdb.com/name/${externalIds.imdb_id}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
                   style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', color: 'var(--gold)' }}>
                  <span className="font-black">IMDb</span> {t('person.profile')}
                </a>
              )}
              {externalIds.imdb_id && (
                <a href={`https://www.imdb.com/name/${externalIds.imdb_id}/awards`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  🏆 {t('film.awardsNav')}
                </a>
              )}
              {externalIds.instagram_id && (
                <a href={`https://www.instagram.com/${externalIds.instagram_id}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
                   style={{ background: 'rgba(131,58,180,0.12)', border: '1px solid rgba(131,58,180,0.3)', color: '#c084fc' }}>
                  📷 Instagram
                </a>
              )}
            </div>

            {/* ── Kariyer İstatistikleri ── */}
            {(firstYear || careerYears || totalMovies > 0 || totalTV > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { value: firstYear, label: t('person.statFirstWork') },
                  { value: careerYears ? `${careerYears}` : null, label: t('person.statCareerYears') },
                  { value: totalMovies > 0 ? String(totalMovies) : null, label: t('film.badge') },
                  { value: totalTV > 0 ? String(totalTV) : null, label: t('series.badge') },
                ].filter(s => s.value).map(stat => (
                  <div key={stat.label}
                    className="relative overflow-hidden rounded-2xl p-4 text-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212,168,67,0.06) 0%, rgba(212,168,67,0.02) 100%)',
                      border: '1px solid rgba(212,168,67,0.15)',
                    }}>
                    <div className="absolute inset-0 opacity-[0.04]"
                      style={{ background: 'radial-gradient(circle at 50% 0%, var(--gold) 0%, transparent 70%)' }} />
                    <p className="relative text-3xl font-black tabular-nums"
                       style={{
                         background: 'linear-gradient(135deg, var(--gold-bright, #F0C060) 0%, var(--gold, #D4A843) 100%)',
                         WebkitBackgroundClip: 'text',
                         WebkitTextFillColor: 'transparent',
                         backgroundClip: 'text',
                       }}>
                      {stat.value}
                    </p>
                    <p className="relative text-[10px] font-medium uppercase tracking-[0.1em] mt-1"
                       style={{ color: 'rgba(212,168,67,0.5)' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Kısa biyografi */}
            {person.biography && (
              <div className="relative">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                    style={{ color: 'rgba(212,168,67,0.45)' }}>
                  {t('person.biography')}
                </h3>
                <p className="text-[13px] leading-relaxed line-clamp-4"
                   style={{ color: 'var(--text-secondary)' }}>
                  {person.biography}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── FOTOĞRAF GALERİSİ ── */}
        {personImages.profiles.length > 1 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: 'rgba(212,168,67,0.5)' }}>{t('person.photos')}</h2>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,168,67,0.2) 0%, transparent 100%)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {personImages.profiles.length} {t('person.photoSuffix')}
              </span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {personImages.profiles.slice(0, 12).map((img, i) => (
                <a key={i}
                   href={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                   target="_blank" rel="noopener noreferrer"
                   className="shrink-0 group">
                  <div className="w-24 sm:w-28 overflow-hidden rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                       style={{ border: '1px solid rgba(212,168,67,0.15)' }}>
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${img.file_path}`}
                      alt=""
                      width={185}
                      height={278}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── ALT SEKMELER ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(20,28,47,0.9) 0%, rgba(14,20,32,0.95) 100%)',
            border: '1px solid rgba(212,168,67,0.1)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Gold top line */}
          <div style={{
            height: 2,
            background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.6) 30%, rgba(240,192,96,0.8) 50%, rgba(212,168,67,0.6) 70%, transparent 100%)',
          }} />

          <div className="p-6 sm:p-8">
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
        </div>

      </div>
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
