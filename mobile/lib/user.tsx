import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { api } from './api'
import { authClient } from './auth-client'

type Gender = 'male' | 'female'

type UserContextType = {
  userId: string | null
  avatarUrl: string | null
  gender: Gender | null
  loading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setAvatarUrl: (url: string) => void
  setGender: (gender: Gender) => void
}

const UserContext = createContext<UserContextType>({
  userId: null,
  avatarUrl: null,
  gender: null,
  loading: true,
  isAuthenticated: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  setAvatarUrl: () => {},
  setGender: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const session = authClient.useSession()
  const [avatarUrl, setAvatarUrlState] = useState<string | null>(null)
  const [gender, setGenderState] = useState<Gender | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const userId = session.data?.user?.id ?? null
  const loading = session.isPending || (!!userId && !profileLoaded)
  const isAuthenticated = !!session.data?.user

  // Load profile when user is authenticated
  useEffect(() => {
    if (!userId) {
      setProfileLoaded(false)
      setAvatarUrlState(null)
      setGenderState(null)
      return
    }

    api.profile
      .get(userId)
      .then((profile) => {
        if (profile.avatar_url) setAvatarUrlState(profile.avatar_url)
        if (profile.gender) setGenderState(profile.gender)
      })
      .catch(() => {
        // Profile doesn't exist yet — that's fine
      })
      .finally(() => setProfileLoaded(true))
  }, [userId])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    await authClient.signUp.email({ email, password, name })
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    await authClient.signIn.email({ email, password })
  }, [])

  const signOut = useCallback(async () => {
    await authClient.signOut()
    setAvatarUrlState(null)
    setGenderState(null)
  }, [])

  const setAvatarUrl = useCallback((url: string) => {
    setAvatarUrlState(url)
  }, [])

  const setGender = useCallback((g: Gender) => {
    setGenderState(g)
  }, [])

  return (
    <UserContext.Provider
      value={{
        userId,
        avatarUrl,
        gender,
        loading,
        isAuthenticated,
        signUp,
        signIn,
        signOut,
        setAvatarUrl,
        setGender,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
