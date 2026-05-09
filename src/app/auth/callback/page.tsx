'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard?welcome=true')
      } else {
        router.replace('/')
      }
    })
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
