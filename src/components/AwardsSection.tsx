import { getTranslations } from '@/lib/i18n'

interface Award {
  titleKey: string
  year?: number
  categoryKey?: string
  emoji: string
  color: string
}

interface Props {
  editorialListIds: string[]
}

const AWARD_MAP: Record<string, Award> = {
  '7cea3842-8803-437d-a9d3-1e05cc6dbe28': { titleKey: 'film.awards.items.oscarBestPicture.title', emoji: '🏆', color: 'text-yellow-400', categoryKey: 'film.awards.items.oscarBestPicture.category' },
  'd001c980-f6e9-470f-88f4-581b5f2636f3': { titleKey: 'film.awards.items.cannesPalme.title', emoji: '🌴', color: 'text-amber-400', categoryKey: 'film.awards.items.cannesPalme.category' },
  'a7190950-d565-406c-a502-a8cc35abb310': { titleKey: 'film.awards.items.mustWatch.title', emoji: '🎬', color: 'text-[--accent]', categoryKey: 'film.awards.items.mustWatch.category' },
  '050fce4b-3998-41f7-9d15-55806013757b': { titleKey: 'film.awards.items.top250.title', emoji: '⭐', color: 'text-[--accent]', categoryKey: 'film.awards.items.top250.category' },
  '9fb62edf-4d8f-4b87-9f7f-86ec1f81219e': { titleKey: 'film.awards.items.imdbTop250.title', emoji: '⭐', color: 'text-[--gold]', categoryKey: 'film.awards.items.imdbTop250.category' },
  'd586f5bd-3933-4468-87ce-f444f0b1a344': { titleKey: 'film.awards.items.century21Best.title', emoji: '🌟', color: 'text-blue-400', categoryKey: 'film.awards.items.century21Best.category' },
  '27eb93b6-669f-4254-9253-89ed0466f73d': { titleKey: 'film.awards.items.turkishCinema.title', emoji: '🇹🇷', color: 'text-red-400', categoryKey: 'film.awards.items.turkishCinema.category' },
}

export default async function AwardsSection({ editorialListIds }: Props) {
  const { t } = await getTranslations()
  const awards = editorialListIds
    .map(id => AWARD_MAP[id])
    .filter(Boolean)

  if (awards.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-wider mb-3">{t('film.awards.title')}</h3>
      <div className="flex flex-wrap gap-2">
        {awards.map((award, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-lg">{award.emoji}</span>
            <div>
              <p className={`text-xs font-bold ${award.color}`}>{t(award.titleKey)}</p>
              <p className="text-[10px] text-[--text-secondary]">{award.categoryKey ? t(award.categoryKey) : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
