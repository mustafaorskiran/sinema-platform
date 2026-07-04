'use client'

import { useState } from 'react'
import { IconBan, IconCheckCircle, IconLoader, IconShield, IconShieldOff } from '@/components/icons'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  isAdmin: boolean
  isBanned: boolean
}

export default function AdminUserActions({ userId, isAdmin, isBanned }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function action(type: 'toggle-admin' | 'toggle-ban') {
    setLoading(type)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: type }),
    })
    router.refresh()
    setLoading(null)
  }

  const btnCls = 'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50'

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={() => action('toggle-admin')}
        disabled={!!loading}
        title={isAdmin ? 'Admin yetkisini kaldır' : 'Admin yap'}
        className={`${btnCls} ${isAdmin
          ? 'bg-[--accent]/15 text-[--accent] hover:bg-[--accent]/25'
          : 'bg-white/5 text-[--text-secondary] hover:text-white hover:bg-white/10'
        }`}
      >
        {loading === 'toggle-admin'
          ? <IconLoader className="h-3.5 w-3.5 animate-spin" />
          : isAdmin ? <IconShieldOff className="h-3.5 w-3.5" /> : <IconShield className="h-3.5 w-3.5" />
        }
        {isAdmin ? 'Yetki Al' : 'Admin Yap'}
      </button>

      <button
        onClick={() => action('toggle-ban')}
        disabled={!!loading}
        title={isBanned ? 'Banı kaldır' : 'Banla'}
        className={`${btnCls} ${isBanned
          ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
          : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
        }`}
      >
        {loading === 'toggle-ban'
          ? <IconLoader className="h-3.5 w-3.5 animate-spin" />
          : isBanned ? <IconCheckCircle className="h-3.5 w-3.5" /> : <IconBan className="h-3.5 w-3.5" />
        }
        {isBanned ? 'Banı Kaldır' : 'Banla'}
      </button>
    </div>
  )
}
