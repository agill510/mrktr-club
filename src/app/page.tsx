'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/Header'
import ChatWindow from '@/components/ChatWindow'
import LogosStrip from '@/components/LogosStrip'
import SignupModal from '@/components/SignupModal'
import styles from './page.module.css'

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const footerRef = useRef<HTMLElement>(null)
  const [footerVisible, setFooterVisible] = useState(false)

  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setFooterVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Header onRegister={() => setModalOpen(true)} />

      <main>
        <div className={styles.hero}>
          <div className={`${styles.heroLeft} anim-hero-left`}>
            <h1 className={styles.h1}>
              Network with<br />
              <span className={styles.griffiths}>Marketing people</span>
              <span className={styles.right}>right.</span>
            </h1>
            <p className={styles.sub}>
              A private community where marketing students, alumni, and professionals
              can connect, share, and learn from each other — without the noise of LinkedIn.
            </p>
          </div>

          <div className={`${styles.heroRight} anim-hero-right`}>
            <ChatWindow />
            <div className={styles.ctaWrap}>
              <button className={styles.ctaBtn} onClick={() => setModalOpen(true)}>
                Join the community →
              </button>
            </div>
          </div>
        </div>

        <LogosStrip />
      </main>

      <div className={styles.divider} />

      <footer ref={footerRef} className={`${styles.footer} ${footerVisible ? styles.footerVisible : ''}`}>
        <a href="/terms" className={styles.footerLink}>Terms of Service</a>
        <div className={styles.dot} />
        <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
        <div className={styles.dot} />
        <a href="/contact" className={styles.footerLink}>Contact</a>
      </footer>

      <SignupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
