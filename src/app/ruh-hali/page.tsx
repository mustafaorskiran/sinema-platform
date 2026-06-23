import Link from 'next/link'
import { MOODS } from '@/lib/moods'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ruh Haline Göre İzle' }

export default function RuhHaliPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white">Şu an nasıl hissediyorsun?</h1>
        <p className="text-[--text-secondary] mt-2 text-sm">
          Ruh haline göre sana özel film ve dizi önerileri
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {MOODS.map(mood => (
          <Link
            key={mood.slug}
            href={`/ruh-hali/${mood.slug}`}
            className={`group flex flex-col items-center text-center p-5 rounded-2xl bg-gradient-to-br ${mood.color} border transition-all hover:scale-105 hover:shadow-lg`}
          >
            <span className="text-4xl mb-3">{mood.emoji}</span>
            <p className="font-semibold text-white text-sm leading-tight">{mood.title}</p>
            <p className="text-[10px] text-[--text-secondary] mt-1 leading-relaxed line-clamp-2">{mood.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
