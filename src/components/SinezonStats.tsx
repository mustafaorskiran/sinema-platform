import { IconStar, IconMessageSquare, IconEye, IconBookmark } from '@/components/icons'
import { getTranslations } from '@/lib/i18n'

interface Props {
  sinezonRating: number | null
  ratingCount: number
  reviewCount: number
  watchedCount: number
  wantCount: number
  tmdbRating: number
  tmdbVoteCount: number
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + 'B'
  return String(n)
}

function RatingBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--gold))',
        }}
      />
    </div>
  )
}

function StatChip({ icon, value, label, iconColor }: {
  icon: React.ReactNode; value: string; label: string; iconColor: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span style={{ color: iconColor }}>{icon}</span>
      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}

export default async function SinezonStats({
  sinezonRating,
  ratingCount,
  reviewCount,
  watchedCount,
  wantCount,
  tmdbRating,
  tmdbVoteCount,
}: Props) {
  const { t } = await getTranslations()
  const isPrimary = ratingCount >= 5

  if (isPrimary && sinezonRating !== null) {
    return (
      <div
        className="mt-5 rounded-2xl p-5 max-w-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(225,29,72,0.12) 0%, var(--bg-card) 60%)',
          border: '1px solid rgba(225,29,72,0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Başlık rozeti */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              letterSpacing: '0.12em',
            }}
          >
            {t('sinezonStats.communityBadge')}
          </span>
        </div>

        {/* Ana puan */}
        <div className="flex items-end gap-3 mb-3">
          <div className="flex items-baseline gap-1.5">
            <IconStar
              className="h-7 w-7 shrink-0 mb-0.5"
              style={{ color: 'var(--gold)', fill: 'var(--gold)' } as React.CSSProperties}
            />
            <span
              className="text-5xl font-black leading-none"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              {sinezonRating.toFixed(1)}
            </span>
            <span className="text-xl font-medium" style={{ color: 'var(--text-secondary)' }}>/10</span>
          </div>
          <span className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            {t('sinezonStats.votes', { count: fmt(ratingCount) })}
          </span>
        </div>

        {/* Bar */}
        <div className="mb-5">
          <RatingBar value={sinezonRating} />
        </div>

        {/* İstatistikler */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {watchedCount > 0 && (
            <StatChip
              icon={<IconEye className="h-4 w-4" />}
              value={fmt(watchedCount)} label={t('sinezonStats.watched')}
              iconColor="#4ade80"
            />
          )}
          <StatChip
            icon={<IconMessageSquare className="h-4 w-4" />}
            value={fmt(reviewCount)} label={t('sinezonStats.reviews')}
            iconColor="#60a5fa"
          />
          {wantCount > 0 && (
            <StatChip
              icon={<IconBookmark className="h-4 w-4" />}
              value={fmt(wantCount)} label={t('sinezonStats.wantToWatch')}
              iconColor="var(--accent)"
            />
          )}
        </div>

        {/* TMDb ikincil */}
        <div
          className="mt-4 pt-3 flex items-center gap-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <IconStar className="h-3 w-3 shrink-0" style={{ color: 'rgba(212,168,67,0.45)', fill: 'rgba(212,168,67,0.45)' } as React.CSSProperties} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            TMDb:{' '}
            <span className="font-semibold">{tmdbRating.toFixed(1)}</span>
            {tmdbVoteCount > 0 && <span className="ml-1 opacity-70">({fmt(tmdbVoteCount)} oy)</span>}
          </span>
        </div>
      </div>
    )
  }

  /* ── İkincil mod: TMDb öne, Sinezon büyüyen ── */
  return (
    <div className="mt-5 max-w-lg space-y-3">
      <div className="flex flex-wrap items-center gap-5">

        {/* TMDb */}
        <div className="flex items-baseline gap-1.5">
          <IconStar
            className="h-5 w-5 shrink-0 mb-0.5"
            style={{ color: 'var(--gold)', fill: 'var(--gold)' } as React.CSSProperties}
          />
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {tmdbRating.toFixed(1)}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>/10</span>
          <span
            className="text-[10px] font-bold ml-1 px-1.5 py-0.5 rounded uppercase tracking-wide"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
          >
            TMDb
          </span>
          {tmdbVoteCount > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>({fmt(tmdbVoteCount)})</span>
          )}
        </div>

        {/* Sinezon — büyüyor */}
        {sinezonRating !== null && (
          <div
            className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-xl"
            style={{
              background: 'rgba(225,29,72,0.1)',
              border: '1px solid rgba(225,29,72,0.25)',
            }}
          >
            <IconStar
              className="h-3.5 w-3.5 shrink-0 mb-0.5"
              style={{ color: 'var(--accent)', fill: 'var(--accent)' } as React.CSSProperties}
            />
            <span className="text-base font-bold" style={{ color: 'var(--accent)' }}>
              {sinezonRating.toFixed(1)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {t('sinezonStats.sinezonVotes', { count: ratingCount })}
            </span>
          </div>
        )}
      </div>

      {/* Topluluk istatistikleri */}
      {(watchedCount + wantCount + reviewCount) > 0 && (
        <div
          className="flex flex-wrap gap-4 rounded-2xl px-4 py-3"
          style={{
            background: 'linear-gradient(160deg, rgba(20,28,47,0.9) 0%, rgba(14,20,32,0.95) 100%)',
            border: '1px solid rgba(212,168,67,0.1)',
          }}
        >
          {watchedCount > 0 && (
            <StatChip icon={<IconEye className="h-3.5 w-3.5" />} value={fmt(watchedCount)} label={t('sinezonStats.watched')} iconColor="#4ade80" />
          )}
          <StatChip icon={<IconMessageSquare className="h-3.5 w-3.5" />} value={fmt(reviewCount)} label={t('sinezonStats.reviews')} iconColor="#60a5fa" />
          {wantCount > 0 && (
            <StatChip icon={<IconBookmark className="h-3.5 w-3.5" />} value={fmt(wantCount)} label={t('sinezonStats.wantToWatch')} iconColor="var(--accent)" />
          )}
        </div>
      )}

      {ratingCount === 0 && (
        <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
          {t('sinezonStats.emptyCta')}
        </p>
      )}
    </div>
  )
}
