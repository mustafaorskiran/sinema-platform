'use client'

import { useState } from 'react'
import FilmografiClient from './FilmografiClient'
import { useLocale } from '@/context/LocaleContext'
import type { TMDbPersonCredit } from '@/lib/types'
import {
  IconFilm, IconHourglass, IconClapperboard, IconTv, IconTrophy,
  IconChevronRight, IconSparkles, IconMasks, IconTent,
} from '@/components/icons'

const GOLD = '#D4A843'
const GOLD_B = '#F0C060'
const GOLD_DIM = 'rgba(212,168,67,0.45)'

type CreditWithRole = TMDbPersonCredit & { role: string }

interface Props {
  castCredits: CreditWithRole[]
  directorCredits: CreditWithRole[]
  writerCredits: CreditWithRole[]
  biography: string
  birthday: string | null
  deathday: string | null
  placeOfBirth: string | null
  alsoKnownAs: string[]
  knownForDepartment: string
  firstYear: string | null
  totalMovies: number
  totalTV: number
  imdbId: string | null
  knownForLabel: Record<string, string>
}

type Tab = 'filmografi' | 'kunye' | 'oduller'

export default function KunyeClient({
  castCredits, directorCredits, writerCredits,
  biography, birthday, deathday, placeOfBirth, alsoKnownAs,
  knownForDepartment, firstYear, totalMovies, totalTV,
  imdbId, knownForLabel,
}: Props) {
  const { t } = useLocale()
  const [tab, setTab] = useState<Tab>('filmografi')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'filmografi', label: t('person.tabFilmography') },
    { key: 'kunye', label: t('person.tabProfile') },
    { key: 'oduller', label: t('person.tabAwards') },
  ]

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function calculateAge(birthday: string, deathday: string | null): number {
    const birth = new Date(birthday)
    const end = deathday ? new Date(deathday) : new Date()
    return Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const age = birthday ? calculateAge(birthday, deathday) : null
  const currentYear = new Date().getFullYear()
  const careerYears = firstYear ? currentYear - Number(firstYear) : null

  return (
    <div>
      {/* ── Sekme başlıkları ── */}
      <div className="flex items-center gap-1 mb-8" style={{ borderBottom: '1px solid rgba(212,168,67,0.12)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200 -mb-px"
            style={tab === t.key
              ? { color: GOLD_B, borderBottom: `2px solid ${GOLD}` }
              : { color: GOLD_DIM, borderBottom: '2px solid transparent' }
            }
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute inset-x-0 bottom-0 h-4 pointer-events-none"
                style={{ background: `linear-gradient(to top, rgba(212,168,67,0.06), transparent)` }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Filmografi ── */}
      {tab === 'filmografi' && (
        <FilmografiClient
          castCredits={castCredits}
          directorCredits={directorCredits}
          writerCredits={writerCredits}
        />
      )}

      {/* ── Künye ── */}
      {tab === 'kunye' && (
        <div className="space-y-8">

          {/* Kariyer istatistikleri */}
          {(firstYear || careerYears || totalMovies > 0 || totalTV > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: firstYear, label: t('person.firstWork'), icon: IconFilm },
                { value: careerYears ? `${careerYears}` : null, label: t('person.careerYears'), icon: IconHourglass },
                { value: totalMovies > 0 ? String(totalMovies) : null, label: t('film.badge'), icon: IconClapperboard },
                { value: totalTV > 0 ? String(totalTV) : null, label: t('series.badge'), icon: IconTv },
              ].filter(s => s.value).map(stat => (
                <div key={stat.label}
                  className="relative overflow-hidden rounded-2xl p-5 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,168,67,0.07) 0%, rgba(212,168,67,0.02) 100%)',
                    border: '1px solid rgba(212,168,67,0.18)',
                  }}>
                  <div className="absolute inset-0 opacity-[0.05]"
                    style={{ background: 'radial-gradient(circle at 50% 0%, var(--gold) 0%, transparent 70%)' }} />
                  <p className="relative flex justify-center mb-0.5" style={{ color: GOLD }}><stat.icon size={20} /></p>
                  <p className="relative text-3xl font-black tabular-nums mt-1"
                     style={{
                       background: `linear-gradient(135deg, ${GOLD_B} 0%, ${GOLD} 100%)`,
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent',
                       backgroundClip: 'text',
                     }}>
                    {stat.value}
                  </p>
                  <p className="relative text-[9.5px] font-semibold uppercase tracking-[0.12em] mt-1.5"
                     style={{ color: GOLD_DIM }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Kişisel bilgiler */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(212,168,67,0.12)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="px-5 py-4"
              style={{ borderBottom: '1px solid rgba(212,168,67,0.1)', background: 'rgba(212,168,67,0.03)' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: GOLD_DIM }}>
                {t('person.personalInfo')}
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(212,168,67,0.08)' }}>
              {knownForDepartment && (
                <InfoRow label={t('person.occupation')} value={knownForLabel[knownForDepartment] ?? knownForDepartment} />
              )}
              {birthday && (
                <InfoRow
                  label={t('person.birthDate')}
                  value={`${formatDate(birthday)}${age !== null && !deathday ? ` (${t('person.ageSuffix', { age })})` : ''}`}
                />
              )}
              {deathday && (
                <InfoRow
                  label={t('person.deathDate')}
                  value={`${formatDate(deathday)}${age !== null ? ` (${t('person.ageSuffix', { age })})` : ''}`}
                />
              )}
              {placeOfBirth && (
                <InfoRow label={t('person.birthPlace')} value={placeOfBirth} />
              )}
              {firstYear && (
                <InfoRow label={t('person.careerStart')} value={firstYear} />
              )}
              {alsoKnownAs.length > 0 && (
                <div className="flex gap-5 px-5 py-4" style={{ borderColor: 'rgba(212,168,67,0.08)' }}>
                  <span className="text-[11px] w-36 shrink-0 pt-0.5" style={{ color: GOLD_DIM }}>{t('person.otherNames')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {alsoKnownAs.map(n => (
                      <span key={n}
                        className="text-[11px] px-2.5 py-1 rounded-lg"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'var(--text-secondary)',
                        }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {imdbId && (
                <div className="flex gap-5 px-5 py-4">
                  <span className="text-[11px] w-36 shrink-0 pt-1" style={{ color: GOLD_DIM }}>{t('person.externalLinks')}</span>
                  <div className="flex flex-wrap gap-2">
                    <a href={`https://www.imdb.com/name/${imdbId}`} target="_blank" rel="noopener noreferrer"
                      className="text-[12px] px-3 py-1.5 rounded-xl font-bold transition-all hover:scale-105"
                      style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', color: GOLD }}>
                      IMDb
                    </a>
                    <a href={`https://www.imdb.com/name/${imdbId}/awards`} target="_blank" rel="noopener noreferrer"
                      className="text-[12px] px-3 py-1.5 rounded-xl transition-all hover:scale-105 inline-flex items-center gap-1.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                      <IconTrophy size={14} /> {t('person.awards')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tam biyografi */}
          {biography && (
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(212,168,67,0.12)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="px-5 py-4"
                style={{ borderBottom: '1px solid rgba(212,168,67,0.1)', background: 'rgba(212,168,67,0.03)' }}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: GOLD_DIM }}>
                  {t('person.biography')}
                </h3>
              </div>
              <div className="px-5 py-5">
                <p className="text-[13px] leading-[1.85] whitespace-pre-line"
                   style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {biography}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Ödüller ── */}
      {tab === 'oduller' && (
        <div className="space-y-4">
          {imdbId ? (
            <>
              <a
                href={`https://www.imdb.com/name/${imdbId}/awards`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-5 rounded-2xl transition-all duration-200 group hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,168,67,0.08) 0%, rgba(212,168,67,0.03) 100%)',
                  border: '1px solid rgba(212,168,67,0.25)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background: 'rgba(212,168,67,0.15)', color: GOLD }}>
                    <IconTrophy size={24} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t('person.imdbAwardsTitle')}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {t('person.imdbAwardsSubtitle')}
                    </p>
                  </div>
                </div>
                <span className="text-[--text-secondary] group-hover:text-white transition-colors"><IconChevronRight size={18} /></span>
              </a>

              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(212,168,67,0.12)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(212,168,67,0.1)', background: 'rgba(212,168,67,0.03)' }}>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: GOLD_DIM }}>
                    {t('person.majorAwardShows')}
                  </h3>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(212,168,67,0.08)' }}>
                  {[
                    { name: 'Academy Awards (Oscar)', icon: IconFilm },
                    { name: 'Emmy Awards', icon: IconTv },
                    { name: 'Golden Globe Awards', icon: IconSparkles },
                    { name: 'BAFTA Awards', icon: IconMasks },
                    { name: 'Screen Actors Guild Awards', icon: IconTent },
                  ].map(award => (
                    <a key={award.name}
                       href={`https://www.imdb.com/name/${imdbId}/awards`}
                       target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 px-5 py-3.5 transition-colors group"
                       style={{ background: 'transparent' }}
                       onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.04)')}
                       onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="w-6 shrink-0 flex items-center justify-center" style={{ color: GOLD_DIM }}><award.icon size={18} /></span>
                      <span className="text-[13px] flex-1 transition-colors"
                            style={{ color: 'var(--text-secondary)' }}>
                        {award.name}
                      </span>
                      <span className="text-[10px] transition-colors flex items-center gap-1" style={{ color: GOLD_DIM }}>
                        IMDb <IconChevronRight size={12} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
              <p className="flex justify-center mb-4"><IconTrophy size={40} /></p>
              <p className="text-sm">{t('person.noAwardsFound')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-5 px-5 py-3.5" style={{ borderColor: 'rgba(212,168,67,0.08)' }}>
      <span className="text-[11px] w-36 shrink-0 pt-0.5 font-medium" style={{ color: GOLD_DIM }}>{label}</span>
      <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{value}</span>
    </div>
  )
}
