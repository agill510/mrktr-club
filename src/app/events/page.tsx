'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppNav from '@/components/AppNav'
import ProtectedRoute from '@/components/ProtectedRoute'
import RegisterModal from '@/components/RegisterModal'
import { events as fallbackEvents, type Event } from '@/data/events'
import { supabase } from '@/lib/supabase'
import styles from './events.module.css'

type Filter = 'all' | 'in-person' | 'virtual'

function EventsInner() {
  const router  = useRouter()
  const [filter, setFilter]           = useState<Filter>('all')
  const [events, setEvents]           = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [registerEvent, setRegisterEvent] = useState<Event | null>(null)

  useEffect(() => {
    supabase.from('events').select('*').order('created_at').then(({ data }) => {
      setEvents(data?.length ? data as Event[] : fallbackEvents)
      setLoadingEvents(false)
    })
  }, [])

  const filtered = useMemo(() =>
    filter === 'all' ? events : events.filter(e => e.type === filter),
  [filter, events])

  return (
    <div className={styles.page}>
      <AppNav active="events" />

      <section className={`${styles.section} ${styles.fadeUp} ${styles.delay1}`}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Events</h1>
          <div className={styles.filterTabs}>
            {(['all', 'in-person', 'virtual'] as Filter[]).map(f => (
              <button
                key={f}
                className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'in-person' ? 'In Person' : 'Virtual'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.eventsGrid}>
          {loadingEvents && [0,1,2].map(i => (
            <div key={i} className={styles.eventCard} style={{ background: 'rgba(255,255,255,.04)', animation: 'none', opacity: 0.5 + i * 0.1 }} />
          ))}
          {!loadingEvents && filtered.map((event, i) => (
            <div
              key={event.id}
              className={`${styles.eventCard} ${styles[event.color]} ${styles.fadeUp}`}
              style={{ animationDelay: `${0.1 + i * 0.06}s` }}
            >
              <div
                className={styles.eventImg}
                style={event.image_url ? {
                  backgroundImage: `url(${event.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: event.image_position || '50% 50%',
                } : undefined}
              />
              <div className={styles.eventOverlay} />
              <div className={styles.eventTypeBadge}>
                {event.type === 'virtual' ? '● Virtual' : '● In Person'}
              </div>
              <div className={styles.eventContent}>
                <h3 className={styles.eventName}>{event.name}</h3>
                <div className={styles.eventMeta}>
                  <span className={styles.eventDate}>{event.date}</span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.eventLoc}>{event.location}</span>
                </div>
                <div className={styles.eventBtns}>
                  <button
                    className={styles.learnMoreBtn}
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    Learn more
                  </button>
                  <button
                    className={styles.registerBtn}
                    onClick={() => setRegisterEvent(event)}
                  >
                    Register →
                  </button>
                </div>
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

      {registerEvent && (
        <RegisterModal event={registerEvent} onClose={() => setRegisterEvent(null)} />
      )}
    </div>
  )
}

export default function EventsPage() {
  return <ProtectedRoute><EventsInner /></ProtectedRoute>
}
