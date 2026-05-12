'use client'

import AppNav from '@/components/AppNav'
import ProtectedRoute from '@/components/ProtectedRoute'
import { videos } from '@/data/videos'
import styles from './videos.module.css'

function VideosInner() {
  return (
    <div className={styles.page}>
      <AppNav active="videos" />

      <section className={`${styles.section} ${styles.fadeUp} ${styles.delay1}`}>
        <h1 className={styles.pageTitle}>Videos</h1>

        <div className={styles.videosGrid}>
          {videos.map((v, i) => (
            <div
              key={v.id}
              className={`${styles.videoCard} ${styles.fadeUp}`}
              style={{ animationDelay: `${0.1 + i * 0.06}s` }}
            >
              <div className={styles.videoThumb} style={v.thumbnail_url ? { backgroundImage: `url(${v.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: v.thumbnail_position || '50% 50%' } : undefined}>
                <div className={styles.playBtn}>▶</div>
                <span className={styles.duration}>{v.duration}</span>
              </div>
              <div className={styles.videoInfo}>
                <p className={styles.videoTitle}>{v.title}</p>
                <p className={styles.videoMeta}>{v.speaker} · {v.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <a href="/home" className={styles.footerLogo}>mrktr.club</a>
        <div className={styles.footerLinks}>
          <a href="/terms"   className={styles.footerLink}>Terms of Service</a>
          <div className={styles.footerDot} />
          <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
          <div className={styles.footerDot} />
          <a href="/contact" className={styles.footerLink}>Contact</a>
        </div>
      </footer>
    </div>
  )
}

export default function VideosPage() {
  return <ProtectedRoute><VideosInner /></ProtectedRoute>
}
