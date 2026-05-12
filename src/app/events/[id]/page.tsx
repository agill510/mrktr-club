'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import AppNav from '@/components/AppNav'
import ProtectedRoute from '@/components/ProtectedRoute'
import RegisterModal from '@/components/RegisterModal'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/data/events'
import styles from './event-detail.module.css'

const GRADIENTS: Record<string, string> = {
  fromTeal:   'linear-gradient(160deg, #0c4d3d 0%, #12af82 100%)',
  fromBlue:   'linear-gradient(160deg, #101e60 0%, #3b82f6 100%)',
  fromPurple: 'linear-gradient(160deg, #4c1d95 0%, #8b5cf6 100%)',
  fromAmber:  'linear-gradient(160deg, #78350f 0%, #f59e0b 100%)',
}

function SpotsBar({ taken, max }: { taken: number; max: number }) {
  const pct = Math.min(100, Math.round((taken / max) * 100))
  const left = max - taken
  return (
    <div className={styles.spots}>
      <div className={styles.spotsBar}><div className={styles.spotsFill} style={{ width: `${pct}%` }} /></div>
      <p className={styles.spotsLabel}>
        {left <= 0 ? 'Sold out' : left <= 10 ? `Only ${left} spots left!` : `${left} of ${max} spots remaining`}
      </p>
    </div>
  )
}

function DetailInner() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [event, setEvent]           = useState<Event | null>(null)
  const [loading, setLoading]       = useState(true)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('events').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setEvent(data as Event)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className={styles.page}>
      <AppNav active="events" />
      <div className={styles.skeletonHero} />
      <div className={styles.skeletonBody}>
        {[200, 120, 80, 160].map((w, i) => (
          <div key={i} className={styles.skeletonLine} style={{ width: w }} />
        ))}
      </div>
    </div>
  )

  if (!event) return (
    <div className={styles.page}>
      <AppNav active="events" />
      <div className={styles.notFound}>
        <p>Event not found.</p>
        <button onClick={() => router.push('/events')}>← Back to Events</button>
      </div>
    </div>
  )

  const gradient   = GRADIENTS[event.color] || GRADIENTS.fromTeal
  const whyPoints  = event.why_attend?.split('\n').filter(Boolean) ?? []
  const spotsLeft  = event.max_spots != null && event.spots_taken != null
    ? event.max_spots - event.spots_taken
    : null

  return (
    <div className={styles.page}>
      <AppNav active="events" />

      {/* ── HERO ── */}
      <div
        className={styles.hero}
        style={{
          background: gradient,
          ...(event.image_url ? {
            backgroundImage: `url(${event.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: event.image_position || '50% 50%',
          } : {}),
        }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.typeBadge}>
            {event.type === 'virtual' ? '● Virtual' : '● In Person'}
          </span>
          <h1 className={styles.heroTitle}>{event.name}</h1>
          <p className={styles.heroMeta}>{event.date}{event.time ? ` · ${event.time}` : ''} · {event.location}</p>
        </div>
      </div>

      {/* ── BREADCRUMB ── */}
      <div className={styles.breadcrumb}>
        <button onClick={() => router.push('/home')}>Home</button>
        <span>›</span>
        <button onClick={() => router.push('/events')}>Events</button>
        <span>›</span>
        <span>{event.name}</span>
      </div>

      {/* ── BODY ── */}
      <div className={styles.body}>

        {/* LEFT */}
        <div className={styles.left}>

          {event.description && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>About This Event</h2>
              <p className={styles.bodyText}>{event.description}</p>
            </section>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>When &amp; Where</h2>
            <div className={styles.whenWhere}>
              <div className={styles.whenItem}>
                <div className={styles.whenIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <p className={styles.whenLabel}>Date</p>
                  <p className={styles.whenValue}>{event.date}</p>
                  {event.time && <p className={styles.whenSub}>{event.time}</p>}
                </div>
              </div>
              <div className={styles.whenItem}>
                <div className={styles.whenIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p className={styles.whenLabel}>{event.type === 'virtual' ? 'Format' : 'Location'}</p>
                  <p className={styles.whenValue}>{event.location}</p>
                  {event.type === 'virtual' && <p className={styles.whenSub}>Link sent after registration</p>}
                </div>
              </div>
            </div>
          </section>

          {event.speaker_name && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Meet the Speaker</h2>
              <div className={styles.speakerCard}>
                {event.speaker_image ? (
                  <Image src={event.speaker_image} alt={event.speaker_name} width={64} height={64} className={styles.speakerImg} />
                ) : (
                  <div className={styles.speakerInitial}>{event.speaker_name.charAt(0)}</div>
                )}
                <div className={styles.speakerInfo}>
                  <p className={styles.speakerName}>{event.speaker_name}</p>
                  {(event.speaker_title || event.speaker_company) && (
                    <p className={styles.speakerRole}>
                      {[event.speaker_title, event.speaker_company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {event.speaker_bio && <p className={styles.speakerBio}>{event.speaker_bio}</p>}
                </div>
              </div>
            </section>
          )}

          {whyPoints.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Why Attend</h2>
              <ul className={styles.whyList}>
                {whyPoints.map((p, i) => (
                  <li key={i} className={styles.whyItem}>
                    <span className={styles.whyDot} />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>

        {/* RIGHT — sticky register card */}
        <div className={styles.right}>
          <div className={styles.registerCard}>
            <div className={styles.registerCardMeta}>
              <div className={styles.registerMetaRow}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>{event.date}</span>
              </div>
              {event.time && (
                <div className={styles.registerMetaRow}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{event.time}</span>
                </div>
              )}
              <div className={styles.registerMetaRow}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{event.location}</span>
              </div>
            </div>

            {event.max_spots != null && event.spots_taken != null && (
              <SpotsBar taken={event.spots_taken} max={event.max_spots} />
            )}

            <button className={styles.registerBtn} onClick={() => setShowRegister(true)}>
              Register Now →
            </button>

            <div className={styles.registerDivider} />

            <div className={styles.shareRow}>
              <span className={styles.shareLabel}>Share</span>
              <button className={styles.shareBtn} onClick={() => navigator.clipboard.writeText(window.location.href)}>
                Copy link
              </button>
            </div>
          </div>

          {event.organizer_name && (
            <div className={styles.organizerCard}>
              <p className={styles.organizerLabel}>Organized by</p>
              <div className={styles.organizerRow}>
                {event.organizer_image ? (
                  <Image src={event.organizer_image} alt={event.organizer_name} width={36} height={36} className={styles.organizerImg} />
                ) : (
                  <div className={styles.organizerInitial}>{event.organizer_name.charAt(0)}</div>
                )}
                <p className={styles.organizerName}>{event.organizer_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

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

      {showRegister && (
        <RegisterModal event={event} onClose={() => setShowRegister(false)} />
      )}
    </div>
  )
}

export default function EventDetailPage() {
  return <ProtectedRoute><DetailInner /></ProtectedRoute>
}
