'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { IconCamera, IconCheckCircle, IconLoader } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

const THEME_COLORS = [
  { value: '#e50914', label: 'Sinema Kırmızısı' },
  { value: '#f59e0b', label: 'Altın Sarısı' },
  { value: '#3b82f6', label: 'Okyanus Mavisi' },
  { value: '#10b981', label: 'Zümrüt Yeşili' },
  { value: '#a855f7', label: 'Galaksi Moru' },
  { value: '#ec4899', label: 'Pembe' },
  { value: '#f97316', label: 'Turuncu' },
  { value: '#06b6d4', label: 'Camgöbeği' },
]

interface Props {
  userId: string
  initialUsername: string
  initialAvatarUrl: string | null
  initialBannerUrl?: string | null
  initialBio?: string | null
  initialLocation?: string | null
  initialWebsite?: string | null
  initialThemeColor?: string | null
  initialEmailNotifications?: boolean
  initialEmailOnFollow?: boolean
  initialEmailOnLike?: boolean
  initialEmailOnReply?: boolean
}

export default function ProfilDuzenleForm({ userId, initialUsername, initialAvatarUrl, initialBannerUrl, initialBio, initialLocation, initialWebsite, initialThemeColor, initialEmailNotifications = true, initialEmailOnFollow = true, initialEmailOnLike = false, initialEmailOnReply = true }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const bannerFileRef = useRef<HTMLInputElement>(null)

  const [username, setUsername] = useState(initialUsername)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerUrl, setBannerUrl] = useState(initialBannerUrl ?? '')
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bio, setBio] = useState(initialBio ?? '')
  const [location, setLocation] = useState(initialLocation ?? '')
  const [website, setWebsite] = useState(initialWebsite ?? '')
  const [themeColor, setThemeColor] = useState(initialThemeColor ?? '#e50914')
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications)
  const [emailOnFollow, setEmailOnFollow] = useState(initialEmailOnFollow)
  const [emailOnLike, setEmailOnLike] = useState(initialEmailOnLike)
  const [emailOnReply, setEmailOnReply] = useState(initialEmailOnReply)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const trimmed = username.trim()
    if (trimmed.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (trimmed !== initialUsername) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .neq('id', userId)
        .maybeSingle()

      if (existing) {
        setError('Bu kullanıcı adı zaten kullanılıyor.')
        setLoading(false)
        return
      }
    }

    // Avatar yükle
    let newAvatarUrl = avatarUrl
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (uploadError) {
        setError('Avatar yüklenirken hata oluştu.')
        setLoading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      newAvatarUrl = `${publicUrl}?t=${Date.now()}`
    }

    // Banner yükle
    let newBannerUrl = bannerUrl || null
    if (bannerFile) {
      const ext = bannerFile.name.split('.').pop()
      const path = `${userId}/banner.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, bannerFile, { upsert: true })
      if (uploadError) {
        setError('Banner yüklenirken hata oluştu.')
        setLoading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      newBannerUrl = `${publicUrl}?t=${Date.now()}`
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: trimmed,
        avatar_url: newAvatarUrl,
        banner_url: newBannerUrl,
        bio: bio.trim() || null,
        location: location.trim() || null,
        website: website.trim() || null,
        theme_color: themeColor,
        email_notifications: emailNotifications,
        email_on_follow: emailOnFollow,
        email_on_like: emailOnLike,
        email_on_reply: emailOnReply,
      })
      .eq('id', userId)

    if (updateError) {
      setError('Profil güncellenirken hata oluştu.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push(`/profil/${trimmed}`), 1200)
  }

  const displayAvatar = previewUrl ?? avatarUrl
  const displayBanner = bannerPreview ?? (bannerUrl || null)
  const initial = username[0]?.toUpperCase() ?? '?'

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* Banner kapak fotoğrafı */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Kapak Fotoğrafı</label>
        <button
          type="button"
          onClick={() => bannerFileRef.current?.click()}
          className="relative w-full h-32 rounded-xl overflow-hidden border border-[--border] hover:border-[--accent]/50 transition-colors group bg-[--bg-secondary] flex items-center justify-center"
        >
          {displayBanner ? (
            <img src={displayBanner} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[--text-secondary] text-sm">Kapak fotoğrafı ekle</span>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <IconCamera className="h-5 w-5 text-white" />
            <span className="text-white text-sm font-medium">Fotoğraf Seç</span>
          </div>
        </button>
        <input ref={bannerFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerChange} />
        <p className="mt-1 text-xs text-[--text-secondary]">Önerilen: 1500×500px · max 5 MB</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative group"
        >
          <div className="h-24 w-24 rounded-full overflow-hidden bg-[--accent] flex items-center justify-center text-4xl font-bold text-white select-none ring-4 ring-[--border] group-hover:ring-[--accent]/60 transition-all">
            {displayAvatar
              ? <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              : initial
            }
          </div>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <IconCamera className="h-6 w-6 text-white" />
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
        <p className="text-xs text-[--text-secondary]">Fotoğrafa tıklayarak değiştir · max 2 MB</p>
      </div>

      {/* Kullanıcı adı */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Kullanıcı Adı</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required maxLength={30} placeholder="kullanici_adi"
          className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
        />
        <p className="mt-1 text-xs text-[--text-secondary]">Harf, rakam ve alt çizgi (_) kullanabilirsin.</p>
      </div>

      {/* Biyografi */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Hakkımda</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={300} placeholder="Kendini kısaca tanıt..."
          className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-[--text-secondary]">{bio.length}/300</p>
      </div>

      {/* Konum */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Konum</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} maxLength={60} placeholder="İstanbul, Türkiye"
          className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
        />
      </div>

      {/* Web sitesi */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Web Sitesi</label>
        <input type="url" value={website} onChange={e => setWebsite(e.target.value)} maxLength={200} placeholder="https://..."
          className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
        />
      </div>

      {/* Profil Teması */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-3">Profil Rengi</label>
        <div className="flex flex-wrap gap-3">
          {THEME_COLORS.map(color => (
            <button
              key={color.value}
              type="button"
              title={color.label}
              onClick={() => setThemeColor(color.value)}
              className={`h-8 w-8 rounded-full transition-all hover:scale-110 ${themeColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[--bg-primary] scale-110' : ''}`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-[--text-secondary]">
          Seçilen: <span style={{ color: themeColor }} className="font-semibold">
            {THEME_COLORS.find(c => c.value === themeColor)?.label ?? themeColor}
          </span>
        </p>
      </div>

      {/* E-posta bildirimleri */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">E-posta Bildirimleri</label>
        <div className="bg-[--bg-secondary] rounded-xl border border-[--border] divide-y divide-[--border]">
          {[
            { label: 'Tüm bildirimleri etkinleştir', value: emailNotifications, set: setEmailNotifications },
            { label: 'Biri beni takip ettiğinde', value: emailOnFollow, set: setEmailOnFollow },
            { label: 'Yorumumu beğendiğinde', value: emailOnLike, set: setEmailOnLike },
            { label: 'Yorumuma yanıt verdiğinde', value: emailOnReply, set: setEmailOnReply },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-[--text-secondary]">{label}</span>
              <button
                type="button"
                onClick={() => set(!value)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? 'bg-[--accent]' : 'bg-[--border]'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
          <IconCheckCircle className="h-4 w-4 shrink-0" />
          Profil güncellendi! Yönlendiriliyorsun...
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-lg border border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30 text-sm font-medium transition-colors"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={loading || success}
          className="flex-1 py-3 rounded-lg bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <IconLoader className="h-4 w-4 animate-spin" />}
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  )
}
