export interface GenreInfo {
  name: string
  movieGenreId: number | null
  tvGenreId: number | null
}

export const GENRE_MAP: Record<string, GenreInfo> = {
  'aksiyon':       { name: 'Aksiyon',          movieGenreId: 28,    tvGenreId: 10759 },
  'macera':        { name: 'Macera',            movieGenreId: 12,    tvGenreId: 10759 },
  'animasyon':     { name: 'Animasyon',         movieGenreId: 16,    tvGenreId: 16    },
  'komedi':        { name: 'Komedi',            movieGenreId: 35,    tvGenreId: 35    },
  'suc':           { name: 'Suç',               movieGenreId: 80,    tvGenreId: 80    },
  'belgesel':      { name: 'Belgesel',          movieGenreId: 99,    tvGenreId: 99    },
  'drama':         { name: 'Drama',             movieGenreId: 18,    tvGenreId: 18    },
  'aile':          { name: 'Aile',              movieGenreId: 10751, tvGenreId: 10751 },
  'fantezi':       { name: 'Fantezi',           movieGenreId: 14,    tvGenreId: null  },
  'tarih':         { name: 'Tarih',             movieGenreId: 36,    tvGenreId: null  },
  'korku':         { name: 'Korku',             movieGenreId: 27,    tvGenreId: null  },
  'muzik':         { name: 'Müzik',             movieGenreId: 10402, tvGenreId: null  },
  'gizem':         { name: 'Gizem',             movieGenreId: 9648,  tvGenreId: 9648  },
  'romantik':      { name: 'Romantik',          movieGenreId: 10749, tvGenreId: null  },
  'bilim-kurgu':   { name: 'Bilim Kurgu',       movieGenreId: 878,   tvGenreId: 10765 },
  'gerilim':       { name: 'Gerilim',           movieGenreId: 53,    tvGenreId: null  },
  'savas':         { name: 'Savaş',             movieGenreId: 10752, tvGenreId: 10768 },
  'western':       { name: 'Western',           movieGenreId: 37,    tvGenreId: 37    },
  'cocuk':         { name: 'Çocuk',             movieGenreId: null,  tvGenreId: 10762 },
  'reality':       { name: 'Reality',           movieGenreId: null,  tvGenreId: 10764 },
}

// TMDb tür ID'sinden slug döndürür (film)
const MOVIE_ID_TO_SLUG: Record<number, string> = {}
const TV_ID_TO_SLUG: Record<number, string> = {}

for (const [slug, info] of Object.entries(GENRE_MAP)) {
  if (info.movieGenreId) MOVIE_ID_TO_SLUG[info.movieGenreId] = slug
  if (info.tvGenreId) TV_ID_TO_SLUG[info.tvGenreId] = slug
}

export function movieGenreToSlug(id: number): string | null {
  return MOVIE_ID_TO_SLUG[id] ?? null
}

export function tvGenreToSlug(id: number): string | null {
  return TV_ID_TO_SLUG[id] ?? null
}
