'use client'

import { useEffect, useState } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  onRegister: () => void
}

export default function Header({ onRegister }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`${styles.header} anim-header ${scrolled ? styles.scrolled : ''}`}>
      <a href="/" className={styles.logo}>mrktr.club</a>
      <div className={styles.buttons}>
        <a href="/login" className={styles.login}>Log in</a>
        <button onClick={onRegister} className={styles.register}>Register</button>
      </div>
    </header>
  )
}
