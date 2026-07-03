import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPersonDetail, getPersonCredits, getPosterUrl, getPersonExternalIds, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import DirectorTimeline from '@/components/DirectorTimeline'
import { IconUser, IconCake, IconCross, IconMapPin, IconStarFilled } from '@/components/icons'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { t } = await getTranslations()
  try {
    const person = await getPersonDetail(Number(id))
    return {
      title: `${person.name} | SineMa`,
      description: person.biography?.slice(0, 160),
    }
  } catch {
    return { title: t('person.metaTitle') }
  }
}

export default async function KisiPage({ params }: Props) {
  const { id } = await params
  const { t } = await getTranslations()
  const DEPT_LABELS: Record<string, string> = {
    Acting: t('person.deptActing'),
    Directing: t('person.deptDirecting'),
    Writing: t('person.deptWriting'),
    Production: t('person.deptProduction'),
    Camera: t('person.deptCamera'),
    Editing: t('person.deptEditing'),
    Sound: t('person.deptSound'),
    Crew: t('person.deptCrew'),
    Art: t('person.deptArt'),
    Costume: t('person.deptCostume'),
  }
  const personId = Number(id)
  if (!personId) notFound()

  const [person, credits, externalIds] = await Promise.all([
    getPersonDetail(personId).catch(() => null),
    getPersonCredits(personId).catch(() => null),
    getPersonExternalIds(personId).catch(() => null),
  ])

  if (!person) notFound()

  const dept = person.known_for_department
  const isActor = dept === 'Acting'

  // Filmografi: cast veya crew — en popüler ve puanlı önce
  const castCredits = (credits?.cast ?? [])
    .filter(c => c.poster_path)
    .sort((a, b) => b.vote_average - a.vote_average)

  const crewCredits = (credits?.crew ?? [])
    .filter(c => c.poster_path && (c.job === 'Director' || c.job === 'Screenplay' || c.job === 'Writer' || c.job === 'Producer'))
    .sort((a, b) => b.vote_average - a.vote_average)

  // Tekrar eden filmleri filtrele (cast'ta zaten varsa crew'den çıkar)
  const castIds = new Set(castCredits.map(c => c.id))
  const uniqueCrew = crewCredits.filter(c => !castIds.has(c.id))

  const mainCredits = isActor
    ? castCredits.slice(0, 24)
    : crewCredits.slice(0, 24)

  const secondaryCredits = isActor ? uniqueCrew.slice(0, 12) : castCredits.slice(0, 12)

  const age = person.birthday
    ? Math.floor((Date.now() - new Date(person.birthday).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Üst bilgi */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        {/* Fotoğraf */}
        <div className="shrink-0">
          <div className="w-40 h-56 sm:w-48 sm:h-72 rounded-2xl overflow-hidden rounded-xl shadow-xl mx-auto sm:mx-0" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            {person.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w342${person.profile_path}`}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[--text-secondary]"><IconUser size={48} /></div>
            )}
          </div>
        </div>

        {/* Bilgiler */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-white mb-1">{person.name}</h1>
          <p className="text-[--accent] font-medium mb-4">{DEPT_LABELS[dept] ?? dept}</p>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[--text-secondary] mb-5">
            {person.birthday && (
              <span className="inline-flex items-center gap-1.5">
                <IconCake size={16} />
                {new Date(person.birthday).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                {!person.deathday && age && ` ${t('person.ageAt', { age })}`}
              </span>
            )}
            {person.deathday && (
              <span className="inline-flex items-center gap-1.5"><IconCross size={16} />{new Date(person.deathday).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            )}
            {person.place_of_birth && <span className="inline-flex items-center gap-1.5"><IconMapPin size={16} />{person.place_of_birth}</span>}
          </div>

          {/* Dış linkler */}
          {externalIds && (
            <div className="flex flex-wrap gap-2 mb-5">
              {externalIds.imdb_id && (
                <a href={`https://www.imdb.com/name/${externalIds.imdb_id}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[--gold]/10 text-[--gold] border border-[--gold]/30 hover:bg-[--gold]/20 transition-colors">
                  IMDb →
                </a>
              )}
              {externalIds.instagram_id && (
                <a href={`https://www.instagram.com/${externalIds.instagram_id}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/30 hover:bg-pink-500/20 transition-colors">
                  Instagram →
                </a>
              )}
            </div>
          )}

          {/* Biyografi */}
          {person.biography && (
            <div className="text-sm text-[--text-secondary] leading-relaxed max-w-2xl">
              <p className="line-clamp-5">{person.biography}</p>
            </div>
          )}
        </div>
      </div>

      {/* Son 2 Yıldaki Projeler */}
      {(() => {
        const twoYearsAgo = String(new Date().getFullYear() - 2)
        const recentAll = [...(credits?.cast ?? []), ...(credits?.crew ?? [])]
          .filter(c => {
            const d = c.release_date ?? c.first_air_date ?? ''
            return d >= twoYearsAgo && c.poster_path
          })
          .sort((a, b) => {
            const da = a.release_date ?? a.first_air_date ?? ''
            const db = b.release_date ?? b.first_air_date ?? ''
            return db.localeCompare(da)
          })
        const uniqueRecent = recentAll.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i).slice(0, 8)
        if (uniqueRecent.length === 0) return null
        return (
          <section className="mb-10 rounded-2xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, var(--accent), #be123c)' }} />
              <h2 className="text-lg font-bold text-white">{t('person.recentProjects')}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(225,29,72,0.1)', color: 'var(--accent)', border: '1px solid rgba(225,29,72,0.2)' }}>{t('person.current')}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-3">
              {uniqueRecent.map(credit => {
                const href = `/${credit.media_type === 'movie' ? 'film' : 'dizi'}/${credit.id}`
                const title = credit.title ?? credit.name ?? `#${credit.id}`
                const year = (credit.release_date ?? credit.first_air_date ?? '').slice(0, 4)
                return (
                  <Link key={`recent-${credit.id}`} href={href} className="group">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden mb-1.5 relative" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <img src={`https://image.tmdb.org/t/p/w185${credit.poster_path}`} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {credit.vote_average > 0 && (
                        <div className="absolute bottom-1 right-1 bg-black/75 rounded px-1 py-0.5 text-[9px] font-bold text-[--gold] inline-flex items-center gap-0.5"><IconStarFilled size={9} />{credit.vote_average.toFixed(1)}</div>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-white group-hover:text-[--accent] transition-colors line-clamp-2 leading-tight">{title}</p>
                    {year && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{year}</p>}
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* Ana Filmografi */}
      {mainCredits.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-5">
            {isActor ? t('person.actedIn') : t('person.directed')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {mainCredits.map(credit => {
              const href = `/${credit.media_type === 'movie' ? 'film' : 'dizi'}/${credit.id}`
              const title = credit.title ?? credit.name ?? `#${credit.id}`
              const year = (credit.release_date ?? credit.first_air_date ?? '').slice(0, 4)

              return (
                <Link key={`cast-${credit.id}`} href={href} className="group">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden rounded-xl group-hover:border-[--accent]/40 transition-colors mb-1.5 relative" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {credit.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    )}
                    {credit.vote_average > 0 && (
                      <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1.5 py-0.5 text-[10px] font-bold text-[--gold] inline-flex items-center gap-0.5">
                        <IconStarFilled size={10} />{credit.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-white group-hover:text-[--accent] transition-colors line-clamp-2 leading-tight">{title}</p>
                  {isActor && credit.character && (
                    <p className="text-[10px] text-[--text-secondary] truncate mt-0.5">{credit.character}</p>
                  )}
                  {year && <p className="text-[10px] text-[--text-secondary]/70 mt-0.5">{year}</p>}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Kariyer Zaman Çizelgesi — sadece yönetmenler için */}
      {!isActor && (
        <DirectorTimeline
          credits={[...(credits?.crew ?? [])].map(c => ({ ...c, media_type: c.media_type ?? 'movie' }))}
          personName={person.name}
        />
      )}

      {/* İkincil Filmografi */}
      {secondaryCredits.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-5">
            {isActor ? t('person.directingProduction') : t('person.actedIn')}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {secondaryCredits.map(credit => {
              const href = `/${credit.media_type === 'movie' ? 'film' : 'dizi'}/${credit.id}`
              const title = credit.title ?? credit.name ?? `#${credit.id}`
              const year = (credit.release_date ?? credit.first_air_date ?? '').slice(0, 4)

              return (
                <Link key={`crew-${credit.id}`} href={href} className="group">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden rounded-xl group-hover:border-[--accent]/40 transition-colors mb-1.5 relative" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {credit.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    )}
                    {credit.vote_average > 0 && (
                      <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1.5 py-0.5 text-[10px] font-bold text-[--gold] inline-flex items-center gap-0.5">
                        <IconStarFilled size={10} />{credit.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-white group-hover:text-[--accent] transition-colors line-clamp-2 leading-tight">{title}</p>
                  {!isActor && credit.character && (
                    <p className="text-[10px] text-[--text-secondary] truncate mt-0.5">{credit.character}</p>
                  )}
                  {year && <p className="text-[10px] text-[--text-secondary]/70 mt-0.5">{year}</p>}
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
