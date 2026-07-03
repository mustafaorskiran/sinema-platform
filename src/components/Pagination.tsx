import Link from 'next/link'
import { IconChevronLeft, IconChevronRight } from '@/components/icons'
import { getTranslations } from '@/lib/i18n'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

const glass = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
const glassHover = 'hover:bg-white/8 hover:border-white/15 transition-all'

export default async function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const { t } = await getTranslations()
  const maxPage = Math.min(totalPages, 500)

  function pageUrl(p: number) {
    const url = new URL(baseUrl, 'http://x')
    url.searchParams.set('sayfa', String(p))
    return url.pathname + url.search
  }

  const pages = getPageNumbers(currentPage, maxPage)

  return (
    <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
      {currentPage > 1 ? (
        <Link href={pageUrl(currentPage - 1)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all hover:scale-105`}
          style={{ ...glass, color: 'rgba(255,255,255,0.5)' }}>
          <IconChevronLeft className="h-4 w-4" /> {t('common.prev')}
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm cursor-not-allowed"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)' }}>
          <IconChevronLeft className="h-4 w-4" /> {t('common.prev')}
        </span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 py-2 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>…</span>
          ) : (
            <Link key={p} href={pageUrl(p as number)}
              className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium text-center transition-all hover:scale-105`}
              style={p === currentPage
                ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }
                : { ...glass, color: 'rgba(255,255,255,0.5)' }
              }>
              {p}
            </Link>
          )
        )}
      </div>

      {currentPage < maxPage ? (
        <Link href={pageUrl(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
          style={{ ...glass, color: 'rgba(255,255,255,0.5)' }}>
          {t('common.next')} <IconChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm cursor-not-allowed"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)' }}>
          {t('common.next')} <IconChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 4) pages.push('...')
  const start = Math.max(2, current - 2)
  const end = Math.min(total - 1, current + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 3) pages.push('...')
  pages.push(total)
  return pages
}
