'use client'

import { useEffect, useState } from 'react'
import styles from './LoginModal.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

export default function LoginModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => { setEmail(''); setPassword('') }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

  return (
    <div
      className={`${styles.backdrop} ${open ? styles.open : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>✕</button>

        <p className={styles.title}>Welcome back</p>
        <p className={styles.sub}>Log in to your mrktr.club account</p>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.cta} disabled={!email || !password}>
            Log in →
          </button>
        </form>
      </div>
    </div>
  )
}
