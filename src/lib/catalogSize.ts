import { createClient } from '@/lib/supabase/server'

/// movies/series tablolarının boyutu saniyeler içinde değişmiyor ama
/// `/api/filmler` ve `/api/diziler` bunu HER istekte `count: 'exact'` ile
/// sorguyordu — büyük tabloda pahalı bir sorgu, gecikmenin ana kaynağıydı.
/// 5 dakikalık bellek-içi önbellekle bu maliyeti ortadan kaldırıyoruz.
const TTL_MS = 5 * 60 * 1000
const cache = new Map<'movies' | 'series', { count: number; at: number }>()

export async function getCachedCatalogCount(table: 'movies' | 'series'): Promise<number> {
  const cached = cache.get(table)
  if (cached && Date.now() - cached.at < TTL_MS) return cached.count

  const supabase = await createClient()
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true }).limit(1)
  const value = count ?? 0
  cache.set(table, { count: value, at: Date.now() })
  return value
}
