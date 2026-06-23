export interface CuratedList {
  slug: string
  title: string
  description: string
  emoji: string
  endpoint: 'discover_movie' | 'discover_tv' | 'top_rated_movie' | 'top_rated_tv'
  params: Record<string, string>
  mediaType: 'film' | 'dizi'
}

export const CURATED_LISTS: CuratedList[] = [
  {
    slug: 'imdb-top-250',
    title: 'En Yüksek Puanlı 250 Film',
    description: 'Tüm zamanların en çok beğenilen ve en yüksek puan alan filmleri',
    emoji: '🏆',
    endpoint: 'discover_movie',
    params: { sort_by: 'vote_average.desc', 'vote_count.gte': '200000', 'vote_average.gte': '8.0' },
    mediaType: 'film',
  },
  {
    slug: 'klasikler',
    title: 'Sinema Klasikleri',
    description: '1980 öncesi çekilmiş, tarihe geçmiş efsanevi filmler',
    emoji: '🎞️',
    endpoint: 'discover_movie',
    params: { sort_by: 'vote_average.desc', 'vote_count.gte': '5000', 'primary_release_date.lte': '1980-12-31' },
    mediaType: 'film',
  },
  {
    slug: 'aksiyon-macera',
    title: 'En İyi Aksiyon & Macera',
    description: 'Adrenalini yüksek, sizi koltuğa kilitleyen en iyi aksiyon filmleri',
    emoji: '💥',
    endpoint: 'discover_movie',
    params: { sort_by: 'vote_average.desc', 'vote_count.gte': '10000', with_genres: '28,12', 'vote_average.gte': '7.5' },
    mediaType: 'film',
  },
  {
    slug: 'komedi-saheserleri',
    title: 'Komedi Şaheserleri',
    description: 'Güldürürken düşündüren, kahkaha garantili filmler',
    emoji: '😂',
    endpoint: 'discover_movie',
    params: { sort_by: 'vote_average.desc', 'vote_count.gte': '5000', with_genres: '35', 'vote_average.gte': '7.5' },
    mediaType: 'film',
  },
  {
    slug: 'gerilim-korku',
    title: 'Gerilim & Korku',
    description: 'Sizi ekrana mıhlayan, nefes kesen gerilim ve korku filmleri',
    emoji: '😱',
    endpoint: 'discover_movie',
    params: { sort_by: 'vote_average.desc', 'vote_count.gte': '5000', with_genres: '53,27', 'vote_average.gte': '7.0' },
    mediaType: 'film',
  },
  {
    slug: 'dunya-sinemasi',
    title: 'Dünya Sineması',
    description: 'Hollywood dışından gelen, kültür sınırlarını aşan şaheserler',
    emoji: '🌍',
    endpoint: 'discover_movie',
    params: { sort_by: 'vote_average.desc', 'vote_count.gte': '5000', without_original_language: 'en', 'vote_average.gte': '7.5' },
    mediaType: 'film',
  },
  {
    slug: 'bilim-kurgu-klasikleri',
    title: 'Bilim Kurgu Şaheserleri',
    description: 'Hayal gücünü zorlayan, geleceği sorgulatan bilim kurgu filmleri',
    emoji: '🚀',
    endpoint: 'discover_movie',
    params: { sort_by: 'vote_average.desc', 'vote_count.gte': '10000', with_genres: '878', 'vote_average.gte': '7.5' },
    mediaType: 'film',
  },
  {
    slug: 'turk-sinemasi',
    title: 'Türk Sineması',
    description: 'Türk sinemasının en iyi ve en sevilen filmleri',
    emoji: '🇹🇷',
    endpoint: 'discover_movie',
    params: { sort_by: 'vote_average.desc', 'vote_count.gte': '500', with_original_language: 'tr', 'vote_average.gte': '6.5' },
    mediaType: 'film',
  },
  {
    slug: 'en-iyi-diziler',
    title: 'En İyi Diziler',
    description: 'Tüm zamanların en yüksek puanlı ve en çok izlenen dizileri',
    emoji: '📺',
    endpoint: 'top_rated_tv',
    params: { 'vote_count.gte': '1000' },
    mediaType: 'dizi',
  },
  {
    slug: 'drama-saheserleri',
    title: 'Drama Şaheserleri',
    description: 'Duygu yüklü, iz bırakan en iyi drama filmleri',
    emoji: '🎭',
    endpoint: 'discover_movie',
    params: { sort_by: 'vote_average.desc', 'vote_count.gte': '10000', with_genres: '18', 'vote_average.gte': '7.8' },
    mediaType: 'film',
  },
]
