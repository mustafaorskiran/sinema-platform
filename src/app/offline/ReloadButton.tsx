'use client'

export default function ReloadButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="px-6 py-2.5 rounded-full bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors"
    >
      Tekrar Dene
    </button>
  )
}
