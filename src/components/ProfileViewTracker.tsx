'use client'
import { useEffect } from 'react'

export default function ProfileViewTracker({ profileId }: { profileId: string }) {
  useEffect(() => {
    fetch('/api/profile-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    }).catch(() => {})
  }, [profileId])
  return null
}
