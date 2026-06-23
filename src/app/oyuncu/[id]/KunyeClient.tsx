'use client'

import { useState } from 'react'
import FilmografiClient from './FilmografiClient'
import type { TMDbPersonCredit } from '@/lib/types'

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
  const [tab, setTab] = useState<Tab>('filmografi')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'filmografi', label: 'Filmografi' },
    { key: 'kunye', label: 'Künye' },
    { key: 'oduller', label: 'Ödüller' },
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
      {/* Sekme başlıkları */}
      <div className="flex items-center gap-1 border-b border-[--border] mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-[--accent] text-white'
                : 'border-transparent text-[--text-secondary] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filmografi */}
      {tab === 'filmografi' && (
        <FilmografiClient
          castCredits={castCredits}
          directorCredits={directorCredits}
          writerCredits={writerCredits}
        />
      )}

      {/* Künye */}
      {tab === 'kunye' && (
        <div className="space-y-6">
          {/* Kariyer özeti kartları */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {firstYear && (
              <div className="rounded-xl border border-[--border] bg-[--bg-card] p-4 text-center">
                <p className="text-2xl font-bold text-white">{firstYear}</p>
                <p className="text-xs text-[--text-secondary] mt-1">İlk Yapım</p>
              </div>
            )}
            {careerYears !== null && careerYears > 0 && (
              <div className="rounded-xl border border-[--border] bg-[--bg-card] p-4 text-center">
                <p className="text-2xl font-bold text-white">{careerYears}</p>
                <p className="text-xs text-[--text-secondary] mt-1">Yıllık Kariyer</p>
              </div>
            )}
            {totalMovies > 0 && (
              <div className="rounded-xl border border-[--border] bg-[--bg-card] p-4 text-center">
                <p className="text-2xl font-bold text-white">{totalMovies}</p>
                <p className="text-xs text-[--text-secondary] mt-1">Film</p>
              </div>
            )}
            {totalTV > 0 && (
              <div className="rounded-xl border border-[--border] bg-[--bg-card] p-4 text-center">
                <p className="text-2xl font-bold text-white">{totalTV}</p>
                <p className="text-xs text-[--text-secondary] mt-1">Dizi</p>
              </div>
            )}
          </div>

          {/* Kişisel bilgiler */}
          <div className="rounded-xl border border-[--border] bg-[--bg-card] overflow-hidden">
            <div className="px-5 py-3 border-b border-[--border] bg-[--bg-secondary]">
              <h3 className="text-sm font-semibold text-white">Kişisel Bilgiler</h3>
            </div>
            <div className="divide-y divide-[--border]">
              {knownForDepartment && (
                <Row label="Meslek" value={knownForLabel[knownForDepartment] ?? knownForDepartment} />
              )}
              {birthday && (
                <Row label="Doğum Tarihi" value={`${formatDate(birthday)}${age !== null && !deathday ? ` (${age} yaşında)` : ''}`} />
              )}
              {deathday && (
                <Row label="Ölüm Tarihi" value={`${formatDate(deathday)}${age !== null ? ` (${age} yaşında)` : ''}`} />
              )}
              {placeOfBirth && (
                <Row label="Doğum Yeri" value={placeOfBirth} />
              )}
              {firstYear && (
                <Row label="Kariyer Başlangıcı" value={firstYear} />
              )}
              {alsoKnownAs.length > 0 && (
                <div className="flex gap-4 px-5 py-3">
                  <span className="text-xs text-[--text-secondary] w-32 shrink-0 pt-0.5">Diğer Adlar</span>
                  <div className="flex flex-wrap gap-1.5">
                    {alsoKnownAs.map(n => (
                      <span key={n} className="text-xs px-2 py-0.5 rounded bg-[--bg-secondary] border border-[--border] text-[--text-secondary]">{n}</span>
                    ))}
                  </div>
                </div>
              )}
              {imdbId && (
                <div className="flex gap-4 px-5 py-3">
                  <span className="text-xs text-[--text-secondary] w-32 shrink-0 pt-0.5">Dış Bağlantılar</span>
                  <div className="flex gap-2">
                    <a href={`https://www.imdb.com/name/${imdbId}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-lg bg-[--gold]/10 border border-[--gold]/30 text-[--gold] hover:bg-[--gold]/20 transition-colors font-semibold">
                      IMDb
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tam biyografi */}
          {biography && (
            <div className="rounded-xl border border-[--border] bg-[--bg-card] overflow-hidden">
              <div className="px-5 py-3 border-b border-[--border] bg-[--bg-secondary]">
                <h3 className="text-sm font-semibold text-white">Biyografi</h3>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-[--text-secondary] leading-relaxed whitespace-pre-line">{biography}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ödüller */}
      {tab === 'oduller' && (
        <div className="space-y-4">
          {imdbId ? (
            <>
              {/* IMDb Ödüller linki */}
              <a
                href={`https://www.imdb.com/name/${imdbId}/awards`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 rounded-xl border border-[--gold]/30 bg-[--gold]/5 hover:bg-[--gold]/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[--gold]/20 flex items-center justify-center text-2xl shrink-0">
                    🏆
                  </div>
                  <div>
                    <p className="text-white font-semibold">IMDb Ödüller & Adaylıklar</p>
                    <p className="text-xs text-[--text-secondary] mt-0.5">Oscar, Emmy, BAFTA, Golden Globe ve daha fazlası</p>
                  </div>
                </div>
                <span className="text-[--text-secondary] group-hover:text-white transition-colors text-lg">→</span>
              </a>

              {/* Önemli ödül törenleri */}
              <div className="rounded-xl border border-[--border] bg-[--bg-card] overflow-hidden">
                <div className="px-5 py-3 border-b border-[--border] bg-[--bg-secondary]">
                  <h3 className="text-sm font-semibold text-white">Başlıca Ödül Törenleri</h3>
                </div>
                <div className="divide-y divide-[--border]">
                  {[
                    { name: 'Academy Awards (Oscar)', emoji: '🎬', url: `https://www.imdb.com/name/${imdbId}/awards` },
                    { name: 'Emmy Awards', emoji: '📺', url: `https://www.imdb.com/name/${imdbId}/awards` },
                    { name: 'Golden Globe Awards', emoji: '🌟', url: `https://www.imdb.com/name/${imdbId}/awards` },
                    { name: 'BAFTA Awards', emoji: '🎭', url: `https://www.imdb.com/name/${imdbId}/awards` },
                    { name: 'Screen Actors Guild Awards', emoji: '🎪', url: `https://www.imdb.com/name/${imdbId}/awards` },
                  ].map(award => (
                    <a key={award.name} href={award.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[--bg-secondary] transition-colors group">
                      <span className="text-lg">{award.emoji}</span>
                      <span className="text-sm text-[--text-secondary] group-hover:text-white transition-colors flex-1">{award.name}</span>
                      <span className="text-[--text-secondary]/40 group-hover:text-[--text-secondary] text-xs transition-colors">IMDb →</span>
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-xs text-[--text-secondary] text-center">
                Ödül verileri IMDb tarafından sağlanmaktadır.
              </p>
            </>
          ) : (
            <div className="text-center py-16 text-[--text-secondary]">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-sm">Bu kişi için ödül bilgisi bulunamadı.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 px-5 py-3">
      <span className="text-xs text-[--text-secondary] w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  )
}
