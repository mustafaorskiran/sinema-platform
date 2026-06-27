import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sinema Evrenler & Seriler | Sinezon',
  description: 'Marvel, DC, Star Wars, Lord of the Rings ve daha fazla sinema evreni — tüm filmler bir arada.',
}

const UNIVERSES = [
  {
    id: 'mcu',
    name: 'Marvel Sinematik Evreni',
    shortName: 'MCU',
    emoji: '🦸',
    desc: 'Iron Man\'dan başlayan 30+ filmlik süper kahraman evreni',
    filmCount: 33,
    color: '#E11D48',
    bg: 'rgba(225,29,72,0.08)',
    border: 'rgba(225,29,72,0.2)',
    collectionId: 131296,
    searchQuery: 'marvel+avengers+ironman',
  },
  {
    id: 'dc',
    name: 'DC Genişletilmiş Evreni',
    shortName: 'DCEU',
    emoji: '🦇',
    desc: 'Batman, Superman, Wonder Woman ve DC karakterlerinin filmleri',
    filmCount: 15,
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.2)',
    collectionId: null,
    searchQuery: 'batman+superman+wonder+woman',
  },
  {
    id: 'starwars',
    name: 'Star Wars Evreni',
    shortName: 'Star Wars',
    emoji: '⚔️',
    desc: 'Uzak, uzak bir galakside geçen destansı maceralar',
    filmCount: 12,
    color: '#facc15',
    bg: 'rgba(250,204,21,0.07)',
    border: 'rgba(250,204,21,0.2)',
    collectionId: 10,
    searchQuery: 'star+wars',
  },
  {
    id: 'lotr',
    name: 'Yüzüklerin Efendisi',
    shortName: 'LOTR',
    emoji: '💍',
    desc: 'Orta Dünya\'nın destansı fantazi serisi',
    filmCount: 6,
    color: '#D4A843',
    bg: 'rgba(212,168,67,0.08)',
    border: 'rgba(212,168,67,0.2)',
    collectionId: 119,
    searchQuery: 'lord+of+the+rings+hobbit',
  },
  {
    id: 'johnwick',
    name: 'John Wick Serisi',
    shortName: 'John Wick',
    emoji: '🔫',
    desc: 'Keanu Reeves\'in efsane aksiyon serisi',
    filmCount: 4,
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.07)',
    border: 'rgba(74,222,128,0.18)',
    collectionId: 404609,
    searchQuery: 'john+wick',
  },
  {
    id: 'jurassicpark',
    name: 'Jurassic Park Evreni',
    shortName: 'Jurassic',
    emoji: '🦕',
    desc: 'Dinozorların geri döndüğü bilim kurgu serisi',
    filmCount: 6,
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.2)',
    collectionId: 328,
    searchQuery: 'jurassic+park+world',
  },
  {
    id: 'fastfurious',
    name: 'Hızlı ve Öfkeli',
    shortName: 'Fast & Furious',
    emoji: '🏎️',
    desc: 'Hızlı arabalar ve büyük aileler — aksiyon serisi',
    filmCount: 11,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
    collectionId: 9485,
    searchQuery: 'fast+furious',
  },
  {
    id: 'nolan',
    name: 'Christopher Nolan Filmleri',
    shortName: 'Nolan',
    emoji: '🧠',
    desc: 'Inception, Interstellar, Tenet ve diğer Nolan şaheserleri',
    filmCount: 12,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.07)',
    border: 'rgba(56,189,248,0.18)',
    collectionId: null,
    searchQuery: 'christopher+nolan',
    directorId: 525,
  },
  {
    id: 'pixar',
    name: 'Pixar Filmleri',
    shortName: 'Pixar',
    emoji: '🎨',
    desc: 'Oyuncak Hikayesi\'nden Soul\'a Pixar\'ın animasyon eserler',
    filmCount: 28,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.07)',
    border: 'rgba(52,211,153,0.18)',
    collectionId: null,
    searchQuery: 'pixar',
  },
  {
    id: 'matrix',
    name: 'Matrix Serisi',
    shortName: 'Matrix',
    emoji: '💊',
    desc: 'Gerçeklik simülasyonu üzerine felsefi aksiyon serisi',
    filmCount: 4,
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.07)',
    border: 'rgba(74,222,128,0.18)',
    collectionId: 2344,
    searchQuery: 'matrix',
  },
  {
    id: 'alien',
    name: 'Alien Evreni',
    shortName: 'Alien',
    emoji: '👾',
    desc: 'Uzayın karanlığında hayatta kalma mücadelesi',
    filmCount: 7,
    color: '#84cc16',
    bg: 'rgba(132,204,22,0.07)',
    border: 'rgba(132,204,22,0.18)',
    collectionId: 8091,
    searchQuery: 'alien+prometheus',
  },
  {
    id: 'monkeyverse',
    name: 'Maymunlar Cehennemi Evreni',
    shortName: 'Planet of Apes',
    emoji: '🐒',
    desc: 'Klasikten yeniden yapıma uzanan efsane maymun serisi',
    filmCount: 9,
    color: '#d97706',
    bg: 'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.2)',
    collectionId: 173710,
    searchQuery: 'planet+of+the+apes',
  },
]

export default function EvrenPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">🌌 Sinema Evrenler & Seriler</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          En büyük sinema evrenlerini keşfet, izlediklerini takip et
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {UNIVERSES.map(u => (
          <div key={u.id} className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
            style={{ background: u.bg, border: `1px solid ${u.border}` }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{u.emoji}</span>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm leading-tight">{u.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: u.color }}>
                  {u.shortName} · {u.filmCount} film
                </p>
              </div>
            </div>
            <p className="text-xs mb-4 flex-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{u.desc}</p>
            <div className="flex gap-2">
              {u.collectionId ? (
                <Link href={`/koleksiyon/${u.collectionId}`}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-80"
                  style={{ background: u.color, color: '#000' }}>
                  Koleksiyonu Gör
                </Link>
              ) : u.directorId ? (
                <Link href={`/kisiler?q=${u.searchQuery}`}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-80"
                  style={{ background: u.color, color: '#000' }}>
                  Yönetmen Sayfası
                </Link>
              ) : null}
              <Link href={`/filmler?ozel=arama&q=${u.searchQuery}`}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.08)', color: u.color, border: `1px solid ${u.border}` }}>
                Filmleri Listele
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Bir koleksiyon veya seriyi kaçırıyoruz?
        </p>
        <Link href="/forum/yeni"
          className="inline-block px-5 py-2 rounded-full text-xs font-medium transition-all hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
          💬 Forum'da öner
        </Link>
      </div>
    </div>
  )
}
