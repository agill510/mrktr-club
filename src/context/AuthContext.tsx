'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profileName: string
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, profileName: '', loading: true })

async function fetchProfileName(userId: string): Promise<string> {
  const timeout = new Promise<string>(resolve => setTimeout(() => resolve(''), 3000))
  const query = supabase.from('profiles').select('name').eq('id', userId).single()
    .then(({ data }) => data?.name ?? '')
    .catch(() => '')
  return Promise.race([query, timeout])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null)
  const [profileName, setProfileName] = useState('')
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        try { setProfileName(await fetchProfileName(u.id)) } catch {}
      }
      setLoading(false)
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) setProfileName(await fetchProfileName(u.id))
      else setProfileName('')
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profileName, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
