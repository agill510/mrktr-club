'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    let handled = false

    const proceed = async (session: { user: { id: string; email?: string; user_metadata?: Record<string, string> } }) => {
      if (handled) return
      handled = true

      const fullName = session.user.user_metadata?.full_name ?? ''

      // Always upsert so the name is saved regardless of whether a trigger
      // pre-created the row with an empty name, or the row doesn't exist yet.
      await supabase.from('profiles').upsert(
        { id: session.user.id, name: fullName, email: session.user.email ?? '' },
        { onConflict: 'id', ignoreDuplicates: false }
      )

      // Check if they've already picked a username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!profile?.username) {
        router.replace('/home?welcome=true&setup=username')
      } else {
        router.replace('/home')
      }
    }

    // Calling getSession() forces the Supabase client to process any
    // #access_token hash in the URL (implicit flow in Next.js)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) proceed(session)
    })

    // Also listen for the state change in case the token exchange is async
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        handled = true
        router.replace('/auth/reset-password')
      } else if (event === 'SIGNED_IN' && session) {
        proceed(session)
      } else if (event === 'SIGNED_OUT' && !handled) {
        router.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#07090e',
      color: 'rgba(255,255,255,.4)',
      fontFamily: 'Helvetica Neue, sans-serif',
      fontSize: '14px',
    }}>
      Logging you in…
    </div>
  )
}
