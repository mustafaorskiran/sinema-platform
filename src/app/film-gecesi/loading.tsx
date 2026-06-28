import { Sk, SkText } from "@/components/skeletons"
export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Sk className="h-8 w-56" />
      <Sk className="h-4 w-72" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: "rgba(20,28,47,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Sk className="h-5 w-40" />
          <SkText lines={2} />
        </div>
      ))}
    </div>
  )
}
