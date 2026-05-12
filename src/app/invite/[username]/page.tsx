'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './invite.module.css'

interface Profile {
  id: string
  name: string
  bio?: string
  avatar_url?: string
  banner_url?: string
  banner_position_y?: number
}

export default function InvitePage() {
  const params   = useParams()
  const router   = useRouter()
  const username = params?.username as string

  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return
    supabase
      .from('profiles')
      .select('id, name, bio, avatar_url, banner_url, banner_position_y')
      .eq('username', username)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile)
        else setNotFound(true)
        setLoading(false)
      })
  }, [username])

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.spinner} />
    </div>
  )

  if (notFound || !profile) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.banner} />
        <div className={styles.body}>
          <p className={styles.notFoundText}>This invite link doesn't exist.</p>
          <button className={styles.cta} onClick={() => router.push('/')}>Visit mrktr.club →</button>
        </div>
      </div>
      <p className={styles.copyright}>© mrktr.club 2026</p>
    </div>
  )

  const firstName = profile.name.split(' ')[0]
  const initial   = profile.name.charAt(0).toUpperCase()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.banner} style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: `center ${profile.banner_position_y ?? 50}%` } : undefined}>
          <div className={styles.avatarWrap}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={firstName} className={styles.avatarImg} />
              : <div className={styles.avatar}>{initial}</div>
            }
          </div>
        </div>

        <div className={styles.body}>
          <p className={styles.invite}>
            <strong>{firstName}</strong> has invited you to join mrktr.club!
          </p>
          <p className={styles.desc}>
            Exclusive events, communities, and videos for marketing students from marketing professionals.
          </p>
          <div className={styles.divider} />
          <button className={styles.cta} onClick={() => router.push('/')}>
            Sign up →
          </button>
        </div>
      </div>
      <p className={styles.copyright}>© mrktr.club 2026</p>
    </div>
  )
}
