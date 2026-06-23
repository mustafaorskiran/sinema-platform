export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Başlık */}
      <div className="mb-10 ml-10">
        <div className="h-7 w-56 bg-[--skeleton] rounded-lg mb-2" />
        <div className="h-4 w-80 bg-[--skeleton] rounded" />
      </div>

      {/* Kullanıcı kartları */}
      <div className="mb-12">
        <div className="h-5 w-52 bg-[--skeleton] rounded mb-5" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[--bg-card] border border-[--border] rounded-2xl p-5 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-[--skeleton]" />
              <div className="h-4 w-24 bg-[--skeleton] rounded" />
              <div className="space-y-1.5 w-full">
                <div className="h-3 w-32 bg-[--skeleton] rounded mx-auto" />
                <div className="h-3 w-28 bg-[--skeleton] rounded mx-auto" />
              </div>
              <div className="h-8 w-full bg-[--skeleton] rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* İçerik grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 w-72 bg-[--skeleton] rounded" />
          <div className="h-8 w-44 bg-[--skeleton] rounded-xl" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[2/3] rounded-xl bg-[--skeleton]" />
              <div className="mt-1.5 h-3 bg-[--skeleton] rounded" />
              <div className="mt-1 h-2.5 w-12 bg-[--skeleton] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
