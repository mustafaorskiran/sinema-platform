import Link from 'next/link'
import { COUNTRIES } from '@/lib/countries'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ülke Sineması' }

export default function UlkelerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Ülke Sineması</h1>
        <p className="text-[--text-secondary] text-sm mt-1">
          Dünya genelinde ülkelere göre film ve dizi keşfet
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {COUNTRIES.map(country => (
          <Link
            key={country.slug}
            href={`/ulke/${country.slug}`}
            className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5 group"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-3xl shrink-0">{country.flag}</span>
            <div className="min-w-0">
              <p className="font-semibold text-white group-hover:text-[--accent] transition-colors leading-tight">
                {country.name}
              </p>
              {country.nativeName && country.nativeName !== country.name && (
                <p className="text-[10px] text-[--text-secondary] mt-0.5 truncate">{country.nativeName}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
