export type MediaType = 'film' | 'dizi'

export interface TMDbMovie {
  id: number
  title: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  media_type?: string
  popularity: number
}

export interface TMDbMovieDetail extends TMDbMovie {
  genres: { id: number; name: string }[]
  runtime: number | null
  number_of_seasons?: number
  number_of_episodes?: number
  status: string
  tagline: string
  production_countries: { name: string }[]
  spoken_languages: { name: string }[]
  production_companies?: { id: number; name: string; logo_path: string | null; origin_country: string }[]
  seasons?: {
    id: number
    season_number: number
    name: string
    episode_count: number
    poster_path: string | null
    air_date: string | null
  }[]
  credits?: {
    cast: TMDbCastMember[]
    crew: TMDbCrewMember[]
  }
  videos?: {
    results: TMDbVideo[]
  }
  budget?: number
  revenue?: number
  external_ids?: { imdb_id?: string | null }
  belongs_to_collection?: { id: number; name: string; poster_path: string | null } | null
}

export interface TMDbCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface TMDbCrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface TMDbVideo {
  id: string
  key: string
  name: string
  site: string
  type: string
  official?: boolean
}

export interface TrailerItem {
  id: number
  title: string
  year: string
  type: 'film' | 'dizi' | 'yakinda'
  poster: string | null
  backdrop: string | null
  trailerKey: string
  trailerName: string
}

export interface TMDbSearchResult {
  results: TMDbMovie[]
  total_results: number
  total_pages: number
  page: number
}

export interface Review {
  id: string
  user_id: string
  media_id: number
  media_type: MediaType
  rating: number
  content: string
  has_spoiler: boolean
  tags: string[]
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  created_at: string
}

export interface TMDbPerson {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
  popularity: number
  also_known_as: string[]
}

export interface TMDbPersonCredit {
  id: number
  title?: string
  name?: string
  character?: string
  job?: string
  media_type: 'movie' | 'tv'
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
}

export interface TMDbPersonCredits {
  cast: TMDbPersonCredit[]
  crew: TMDbPersonCredit[]
}

export interface ReviewInsert {
  media_id: number
  media_type: MediaType
  rating: number
  content: string
}
