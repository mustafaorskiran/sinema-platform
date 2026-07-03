'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import MovieCard from '@/components/MovieCard'
import { SkMovieCard } from '@/components/skeletons'
import { useLocale } from '@/context/LocaleContext'

interface InfiniteGridProps {
  initialItems: any[]
  initialTotalPages: number
  apiPath: string
  searchParams: Record<string, string>
  type: 'film' | 'dizi'
  watchedIds?: number[]
  filterMode?: 'gormediklerim'
}

export default function InfiniteGrid({
  initialItems,
  initialTotalPages,
  apiPath,
  searchParams,
  type,
  watchedIds,
  filterMode,
}: InfiniteGridProps) {
  const { t } = useLocale()
  const [items, setItems] = useState(initialItems)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialTotalPages > 1)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const nextPage = page + 1
    const params = new URLSearchParams({ ...searchParams, sayfa: String(nextPage) })
    try {
      const res = await fetch(`${apiPath}?${params}`)
      if (!res.ok) return
      const data: { results: any[]; total_pages: number } = await res.json()
      setItems(prev => [...prev, ...data.results])
      setPage(nextPage)
      setHasMore(nextPage < data.total_pages)
    } catch {
      // network error — don't change state, will retry on next scroll
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, apiPath, searchParams])

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '500px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  const watchedSet = watchedIds ? new Set(watchedIds) : null
  const visibleItems = filterMode === 'gormediklerim' && watchedSet
    ? items.filter((item: any) => !watchedSet.has(item.id))
    : items

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {visibleItems.map((item: any) => (
          <MovieCard key={item.id} media={item} type={type} />
        ))}
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <SkMovieCard key={`sk-${i}`} />
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="h-20 flex items-center justify-center">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-[--text-secondary]">
              <div className="w-4 h-4 border-2 border-[--accent] border-t-transparent rounded-full animate-spin" />
              {t('common.loading')}
            </div>
          )}
        </div>
      )}

      {!hasMore && items.length > 40 && (
        <p className="text-center text-sm text-[--text-secondary] py-8">
          {t('infiniteGrid.itemsLoaded', { count: items.length.toLocaleString('tr-TR') })}
        </p>
      )}
    </div>
  )
}
