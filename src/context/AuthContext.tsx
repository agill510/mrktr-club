'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profileName: string
  avatarUrl: string
  loading: boolean
  refreshProfile: () => Promise<void>
}

const noop = async () => {}
const AuthContext = createContext<AuthContextType>({ user: null, profileName: '', avatarUrl: '', loading: true, refreshProfile: noop })

interface ProfileData { name: string; avatar_url: string }

async function fetchProfile(userId: string): Promise<ProfileData> {
  const timeout = new Promise<ProfileData>(resolve => setTimeout(() => resolve({ name: '', avatar_url: '' }), 3000))
  const query   = new Promise<ProfileData>(async resolve => {
    try {
      const { data, error } = await supabase.from('profiles').select('name, avatar_url').eq('id', userId).single()
      if (!error && data) {
        resolve({ name: data.name ?? '', avatar_url: data.avatar_url ?? '' })
        return
      }
      // avatar_url column may not exist yet — fall back to name only
      const { data: nameOnly } = await supabase.from('profiles').select('name').eq('id', userId).single()
      resolve({ name: nameOnly?.name ?? '', avatar_url: '' })
    } catch {
      resolve({ name: '', avatar_url: '' })
    }
  })
  return Promise.race([query, timeout])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,        setUser]        = useState<User | null>(null)
  const [profileName, setProfileName] = useState('')
  const [avatarUrl,   setAvatarUrl]   = useState('')
  const [loading,     setLoading]     = useState(true)

  const refreshProfile = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    const profile = await fetchProfile(u.id)
    setProfileName(profile.name)
    setAvatarUrl(profile.avatar_url)
  }, [])

  useEffect(() => {
    const fallback = setTimeout(() => setLoading(false), 5000)
    let fetchSeq = 0

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      clearTimeout(fallback)
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const seq = ++fetchSeq
        try {
          const profile = await fetchProfile(u.id)
          if (seq === fetchSeq) {
            setProfileName(profile.name)
            setAvatarUrl(profile.avatar_url)
          }
        } catch {}
      } else {
        setProfileName('')
        setAvatarUrl('')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profileName, avatarUrl, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
