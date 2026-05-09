'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/auth/reset-password')
      } else if (event === 'SIGNED_IN' && session) {
        const type = new URLSearchParams(window.location.hash.slice(1)).get('type')
        if (type === 'signup') {
          router.replace('/dashboard?welcome=true')
        } else {
          router.replace('/dashboard')
        }
      } else if (!session) {
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
