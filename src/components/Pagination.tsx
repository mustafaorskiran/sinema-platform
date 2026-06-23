import Link from 'next/link'
import { IconChevronLeft, IconChevronRight } from '@/components/icons'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
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
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-[--accent]/50 transition-colors">
          <IconChevronLeft className="h-4 w-4" /> Önceki
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary]/40 cursor-not-allowed">
          <IconChevronLeft className="h-4 w-4" /> Önceki
        </span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 py-2 text-sm text-[--text-secondary]">…</span>
          ) : (
            <Link key={p} href={pageUrl(p as number)}
              className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
                p === currentPage
                  ? 'bg-[--accent] text-white'
                  : 'bg-[--bg-card] border border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/50'
              }`}>
              {p}
            </Link>
          )
        )}
      </div>

      {currentPage < maxPage ? (
        <Link href={pageUrl(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-[--accent]/50 transition-colors">
          Sonraki <IconChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary]/40 cursor-not-allowed">
          Sonraki <IconChevronRight className="h-4 w-4" />
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
