export interface Country {
  slug: string
  name: string
  code: string // ISO 3166-1 alpha-2
  flag: string
  nativeName?: string
}

export const COUNTRIES: Country[] = [
  { slug: 'turkiye',      name: 'Türkiye',        code: 'TR', flag: '🇹🇷', nativeName: 'Türkiye' },
  { slug: 'amerika',      name: 'Amerika',         code: 'US', flag: '🇺🇸', nativeName: 'United States' },
  { slug: 'ingiltere',    name: 'İngiltere',       code: 'GB', flag: '🇬🇧', nativeName: 'United Kingdom' },
  { slug: 'fransa',       name: 'Fransa',          code: 'FR', flag: '🇫🇷', nativeName: 'France' },
  { slug: 'italya',       name: 'İtalya',          code: 'IT', flag: '🇮🇹', nativeName: 'Italia' },
  { slug: 'almanya',      name: 'Almanya',         code: 'DE', flag: '🇩🇪', nativeName: 'Deutschland' },
  { slug: 'japonya',      name: 'Japonya',         code: 'JP', flag: '🇯🇵', nativeName: '日本' },
  { slug: 'guney-kore',   name: 'Güney Kore',      code: 'KR', flag: '🇰🇷', nativeName: '한국' },
  { slug: 'hindistan',    name: 'Hindistan',       code: 'IN', flag: '🇮🇳', nativeName: 'India' },
  { slug: 'ispanya',      name: 'İspanya',         code: 'ES', flag: '🇪🇸', nativeName: 'España' },
  { slug: 'cin',          name: 'Çin',             code: 'CN', flag: '🇨🇳', nativeName: '中国' },
  { slug: 'iran',         name: 'İran',            code: 'IR', flag: '🇮🇷', nativeName: 'ایران' },
  { slug: 'rusya',        name: 'Rusya',           code: 'RU', flag: '🇷🇺', nativeName: 'Россия' },
  { slug: 'meksika',      name: 'Meksika',         code: 'MX', flag: '🇲🇽', nativeName: 'México' },
  { slug: 'brezilya',     name: 'Brezilya',        code: 'BR', flag: '🇧🇷', nativeName: 'Brasil' },
  { slug: 'arjantin',     name: 'Arjantin',        code: 'AR', flag: '🇦🇷', nativeName: 'Argentina' },
  { slug: 'isvec',        name: 'İsveç',           code: 'SE', flag: '🇸🇪', nativeName: 'Sverige' },
  { slug: 'danimarka',    name: 'Danimarka',       code: 'DK', flag: '🇩🇰', nativeName: 'Danmark' },
  { slug: 'avustralya',   name: 'Avustralya',      code: 'AU', flag: '🇦🇺', nativeName: 'Australia' },
  { slug: 'kanada',       name: 'Kanada',          code: 'CA', flag: '🇨🇦', nativeName: 'Canada' },
]

export function getCountryBySlug(slug: string): Country | undefined {
  return COUNTRIES.find(c => c.slug === slug)
}
