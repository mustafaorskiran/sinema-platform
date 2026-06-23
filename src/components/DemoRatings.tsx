import { createClient } from '@/lib/supabase/server'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
}

interface RatingRow {
  rating: number
  birth_year: number | null
  country: string | null
}

interface GroupStat {
  label: string
  avg: number | null
  count: number
}

const CURRENT_YEAR = 2026
const MIN_VOTES = 3

function calcAvg(rows: RatingRow[]): number | null {
  if (rows.length < MIN_VOTES) return null
  const total = rows.reduce((sum, r) => sum + r.rating, 0)
  return total / rows.length
}

export default async function DemoRatings({ mediaId, mediaType }: Props) {
  const supabase = await createClient()

  const { data: rawRows } = await supabase
    .from('reviews')
    .select('rating, profiles(birth_year, country)')
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .gt('rating', 0)

  if (!rawRows || rawRows.length === 0) return null

  // Flatten join
  const rows: RatingRow[] = (rawRows as any[]).map((r) => ({
    rating: r.rating as number,
    birth_year: (r.profiles as { birth_year: number | null } | null)?.birth_year ?? null,
    country: (r.profiles as { country: string | null } | null)?.country ?? null,
  }))

  // Yaş grupları
  const group1825 = rows.filter((r) => {
    if (!r.birth_year) return false
    const age = CURRENT_YEAR - r.birth_year
    return age >= 18 && age <= 25
  })
  const group2640 = rows.filter((r) => {
    if (!r.birth_year) return false
    const age = CURRENT_YEAR - r.birth_year
    return age >= 26 && age <= 40
  })
  const group40plus = rows.filter((r) => {
    if (!r.birth_year) return false
    const age = CURRENT_YEAR - r.birth_year
    return age > 40
  })

  // Ülke grupları
  const groupTR = rows.filter((r) => r.country === 'TR')
  const groupWorld = rows.filter((r) => r.country !== 'TR')

  const groups: GroupStat[] = [
    { label: '18–25', avg: calcAvg(group1825), count: group1825.length },
    { label: '26–40', avg: calcAvg(group2640), count: group2640.length },
    { label: '40+', avg: calcAvg(group40plus), count: group40plus.length },
    { label: 'Türkiye', avg: calcAvg(groupTR), count: groupTR.length },
    { label: 'Dünya', avg: calcAvg(groupWorld), count: groupWorld.length },
  ]

  // En az bir grubun verisi varsa göster
  const hasAnyData = groups.some((g) => g.avg !== null)
  if (!hasAnyData) return null

  return (
    <div className="mt-10 bg-[--bg-card] border border-[--border] rounded-2xl p-4">
      <h2
        className="text-lg font-bold text-white mb-4"
        style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '10px' }}
      >
        Demografiye Göre Puan
      </h2>

      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.label} className="flex items-center gap-3">
            {/* Etiket */}
            <span className="text-sm text-[--text-secondary] w-16 shrink-0">{group.label}</span>

            {/* Progress bar alanı */}
            <div className="flex-1 relative h-2 rounded-full bg-[--bg-secondary] overflow-hidden">
              {group.avg !== null && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[--accent] transition-all duration-500"
                  style={{ width: `${(group.avg / 10) * 100}%` }}
                />
              )}
            </div>

            {/* Puan / yetersiz veri */}
            <span className="text-sm font-semibold text-white w-24 text-right shrink-0">
              {group.avg !== null
                ? `${group.avg.toFixed(1)} / 10`
                : (
                  <span className="text-xs text-[--text-secondary] font-normal">
                    Yeterli veri yok
                  </span>
                )}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[--text-secondary] mt-3 opacity-60">
        * Her grup için minimum {MIN_VOTES} oy gereklidir.
      </p>
    </div>
  )
}
