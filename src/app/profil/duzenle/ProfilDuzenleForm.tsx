'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { IconCamera, IconCheckCircle, IconLoader, IconEye, IconEyeOff, IconFilm, IconStar, IconLock, IconChevronDown } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/context/LocaleContext'

function getPasswordStrength(pw: string, t: (key: string) => string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (s <= 1) return { score: s, label: t('auth.strengthVeryWeak'), color: '#f87171' }
  if (s === 2) return { score: s, label: t('auth.strengthWeak'), color: '#fb923c' }
  if (s === 3) return { score: s, label: t('auth.strengthMedium'), color: '#facc15' }
  if (s === 4) return { score: s, label: t('auth.strengthStrong'), color: '#4ade80' }
  return { score: s, label: t('auth.strengthVeryStrong'), color: '#22c55e' }
}

const THEME_COLOR_VALUES = [
  { value: '#e50914', key: 'cinemaRed' },
  { value: '#f59e0b', key: 'goldenYellow' },
  { value: '#3b82f6', key: 'oceanBlue' },
  { value: '#10b981', key: 'emeraldGreen' },
  { value: '#a855f7', key: 'galaxyPurple' },
  { value: '#ec4899', key: 'pink' },
  { value: '#f97316', key: 'orange' },
  { value: '#06b6d4', key: 'cyan' },
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
  initialTwitterUrl?: string | null
  initialLetterboxdUrl?: string | null
  initialImdbUrl?: string | null
  initialBirthYear?: number | null
  initialCountry?: string | null
}

export default function ProfilDuzenleForm({ userId, initialUsername, initialAvatarUrl, initialBannerUrl, initialBio, initialLocation, initialWebsite, initialThemeColor, initialEmailNotifications = true, initialEmailOnFollow = true, initialEmailOnLike = false, initialEmailOnReply = true, initialTwitterUrl, initialLetterboxdUrl, initialImdbUrl, initialBirthYear, initialCountry }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const fileRef = useRef<HTMLInputElement>(null)
  const bannerFileRef = useRef<HTMLInputElement>(null)

  const THEME_COLORS = useMemo(() => THEME_COLOR_VALUES.map(c => ({ ...c, label: t(`settings.themeColor.${c.key}`) })), [t])

  // Security section state
  const [newEmail, setNewEmail]       = useState('')
  const [emailMsg, setEmailMsg]       = useState('')
  const [emailErr, setEmailErr]       = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  const [curPass, setCurPass]         = useState('')
  const [newPass, setNewPass]         = useState('')
  const [confPass, setConfPass]       = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [passMsg, setPassMsg]         = useState('')
  const [passErr, setPassErr]         = useState('')
  const [passLoading, setPassLoading] = useState(false)

  const [deleteInput, setDeleteInput] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteErr, setDeleteErr]     = useState('')
  const [secOpen, setSecOpen]         = useState(false)

  const strength = useMemo(() => getPasswordStrength(newPass, t), [newPass, t])

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail) return
    setEmailLoading(true); setEmailErr(''); setEmailMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) { setEmailErr(t('settings.emailChangeFailed')); setEmailLoading(false); return }
    setEmailMsg(t('settings.emailChangeSuccess'))
    setNewEmail(''); setEmailLoading(false)
  }

  async function handlePassChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPass.length < 6) { setPassErr(t('settings.newPasswordMinLength')); return }
    if (newPass !== confPass) { setPassErr(t('settings.newPasswordsMismatch')); return }
    setPassLoading(true); setPassErr(''); setPassMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) { setPassErr(t('settings.passwordChangeFailed')); setPassLoading(false); return }
    setPassMsg(t('settings.passwordChangeSuccess'))
    setCurPass(''); setNewPass(''); setConfPass(''); setPassLoading(false)
  }

  async function handleDeleteAccount() {
    if (deleteInput !== initialUsername) { setDeleteErr(t('settings.deleteUsernameMismatch')); return }
    setDeleteLoading(true); setDeleteErr('')
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch { setDeleteErr(t('settings.deleteAccountFailed')); setDeleteLoading(false) }
  }

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
  const [twitterUrl, setTwitterUrl] = useState(initialTwitterUrl ?? '')
  const [letterboxdUrl, setLetterboxdUrl] = useState(initialLetterboxdUrl ?? '')
  const [imdbUrl, setImdbUrl] = useState(initialImdbUrl ?? '')
  const [birthYear, setBirthYear] = useState<string>(initialBirthYear ? String(initialBirthYear) : '')
  const [country, setCountry] = useState(initialCountry ?? '')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Sadece JPEG, PNG, WEBP veya GIF dosyası yükleyebilirsiniz.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profil fotoğrafı en fazla 2 MB olabilir.')
      return
    }
    setError('')
    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.type === 'image/gif') {
      setError('Kapak fotoğrafı için sadece JPEG, PNG veya WEBP yükleyebilirsiniz.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Kapak fotoğrafı en fazla 5 MB olabilir.')
      return
    }
    setError('')
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const trimmed = username.trim()
    if (trimmed.length < 3) {
      setError(t('settings.usernameMinLength'))
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError(t('settings.usernameInvalidChars'))
      return
    }

    setLoading(true)
    try {
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
          twitter_url: twitterUrl.trim() || null,
          letterboxd_url: letterboxdUrl.trim() || null,
          imdb_url: imdbUrl.trim() || null,
          birth_year: birthYear ? Number(birthYear) : null,
          country: country.trim() || null,
          theme_color: themeColor,
          email_notifications: emailNotifications,
          email_on_follow: emailOnFollow,
          email_on_like: emailOnLike,
          email_on_reply: emailOnReply,
        })
        .eq('id', userId)

      if (updateError) {
        setError('Profil güncellenirken hata oluştu.')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push(`/profil/${trimmed}`), 1200)
    } catch {
      setError('Profil güncellenirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const displayAvatar = previewUrl ?? avatarUrl
  const displayBanner = bannerPreview ?? (bannerUrl || null)
  const initial = username[0]?.toUpperCase() ?? '?'

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* Banner kapak fotoğrafı */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Kapak Fotoğrafı</label>
        <button
          type="button"
          onClick={() => bannerFileRef.current?.click()}
          className="relative w-full h-32 rounded-xl overflow-hidden transition-colors group flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
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
          className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        <p className="mt-1 text-xs text-[--text-secondary]">Harf, rakam ve alt çizgi (_) kullanabilirsin.</p>
      </div>

      {/* Biyografi */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Hakkımda</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={300} placeholder="Kendini kısaca tanıt..."
          className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors resize-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <p className="mt-1 text-xs text-[--text-secondary]">{bio.length}/300</p>
      </div>

      {/* Konum */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Konum</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} maxLength={60} placeholder="İstanbul, Türkiye"
          className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      {/* Demografik Bilgiler */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-3">Demografik Bilgiler</label>
        <p className="text-xs text-[--text-secondary]/60 mb-3">Film puanlarında yaş grubu istatistikleri için kullanılır, paylaşılmaz.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[--text-secondary] mb-1.5">Doğum Yılı</label>
            <input
              type="number"
              value={birthYear}
              onChange={e => setBirthYear(e.target.value)}
              min={1920} max={new Date().getFullYear() - 13}
              placeholder="1990"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div>
            <label className="block text-xs text-[--text-secondary] mb-1.5">Ülke Kodu</label>
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="TR"
              maxLength={2}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors uppercase"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>
      </div>

      {/* Web sitesi */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Web Sitesi</label>
        <input type="url" value={website} onChange={e => setWebsite(e.target.value)} maxLength={200} placeholder="https://..."
          className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      {/* Sosyal Bağlantılar */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-3">Sosyal Bağlantılar</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg w-6 text-center">𝕏</span>
            <input type="url" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} maxLength={200} placeholder="https://x.com/kullaniciadi"
              className="flex-1 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 flex items-center justify-center"><IconFilm size={18} /></span>
            <input type="url" value={letterboxdUrl} onChange={e => setLetterboxdUrl(e.target.value)} maxLength={200} placeholder="https://letterboxd.com/kullaniciadi"
              className="flex-1 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 flex items-center justify-center"><IconStar size={18} /></span>
            <input type="url" value={imdbUrl} onChange={e => setImdbUrl(e.target.value)} maxLength={200} placeholder="https://imdb.com/user/..."
              className="flex-1 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>
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
        <div className="rounded-xl divide-y" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem' }}>
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
        <button type="button" onClick={() => router.back()}
          className="flex-1 py-3 rounded-lg border border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30 text-sm font-medium transition-colors">
          Vazgeç
        </button>
        <button type="submit" disabled={loading || success}
          className="flex-1 py-3 rounded-lg bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <IconLoader className="h-4 w-4 animate-spin" />}
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>

    {/* ── Güvenlik Ayarları ── */}
    <div className="mt-6 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <button type="button" onClick={() => setSecOpen(!secOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center"><IconLock size={16} /></span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Güvenlik Ayarları</span>
        </div>
        <span className="transition-transform" style={{ color: 'var(--text-secondary)', transform: secOpen ? 'rotate(180deg)' : 'none' }}><IconChevronDown size={14} /></span>
      </button>

      {secOpen && (
        <div className="px-5 pb-5 pt-3 space-y-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* E-posta değiştir */}
          <form onSubmit={handleEmailChange} className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'rgba(212,168,67,0.5)' }}>E-posta Değiştir</p>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              required placeholder="Yeni e-posta adresi"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
            />
            {emailMsg && <p className="text-[12px] text-green-400">{emailMsg}</p>}
            {emailErr && <p className="text-[12px]" style={{ color: '#f87171' }}>{emailErr}</p>}
            <button type="submit" disabled={emailLoading}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-80"
              style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.25)', color: '#D4A843' }}>
              {emailLoading ? 'Gönderiliyor...' : 'Doğrulama Gönder'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {/* Şifre değiştir */}
          <form onSubmit={handlePassChange} className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'rgba(212,168,67,0.5)' }}>Şifre Değiştir</p>
            <div className="relative">
              <input type={showNewPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                required placeholder="Yeni şifre (en az 6 karakter)"
                className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--text-primary)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {showNewPass ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
              </button>
            </div>
            {newPass.length > 0 && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all"
                      style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <p className="text-[11px]" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
            <input type={showNewPass ? 'text' : 'password'} value={confPass} onChange={e => setConfPass(e.target.value)}
              required placeholder="Yeni şifreyi tekrar gir"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
            />
            {passMsg && <p className="text-[12px] text-green-400">{passMsg}</p>}
            {passErr && <p className="text-[12px]" style={{ color: '#f87171' }}>{passErr}</p>}
            <button type="submit" disabled={passLoading}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-80"
              style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.25)', color: '#D4A843' }}>
              {passLoading ? 'Güncelleniyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        </div>
      )}
    </div>

    {/* ── Tehlikeli Alan ── */}
    <div className="mt-4 rounded-2xl p-5" style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(248,113,113,0.5)' }}>Tehlikeli Alan</p>
      <p className="text-sm font-semibold mb-1" style={{ color: '#f87171' }}>Hesabı Sil</p>
      <p className="text-[12px] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Bu işlem geri alınamaz. Tüm yorum, puan ve listeler kalıcı olarak silinir.
      </p>
      <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
        placeholder={`Onaylamak için "${initialUsername}" yaz`}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all mb-3"
        style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--text-primary)' }}
      />
      {deleteErr && <p className="text-[12px] mb-2" style={{ color: '#f87171' }}>{deleteErr}</p>}
      <button onClick={handleDeleteAccount} disabled={deleteLoading || deleteInput !== initialUsername}
        className="px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
        style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
        {deleteLoading ? 'Siliniyor...' : 'Hesabı Kalıcı Olarak Sil'}
      </button>
    </div>
    </>
  )
}
