import Logo from '@/components/Logo'

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Logo variant="icon" size="lg" className="animate-pulse" />
      <Logo variant="wordmark" size="sm" />
    </div>
  )
}
