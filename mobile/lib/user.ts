import { useState, useCallback } from 'react'

// Simple user state for hackathon - no real auth
// In production, this would use BetterAuth
const DEMO_USER_ID = 'demo-user-1'

let _avatarUrl: string | null = null

export function useUser() {
  const [avatarUrl, setAvatarUrlState] = useState<string | null>(_avatarUrl)

  const setAvatarUrl = useCallback((url: string) => {
    _avatarUrl = url
    setAvatarUrlState(url)
  }, [])

  return {
    userId: DEMO_USER_ID,
    avatarUrl,
    setAvatarUrl,
  }
}
