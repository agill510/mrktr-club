'use client'

import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import AppNav from '@/components/AppNav'
import ProtectedRoute from '@/components/ProtectedRoute'
import RegisterModal from '@/components/RegisterModal'
import ChooseUsernameModal from '@/components/ChooseUsernameModal'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { events as fallbackEvents } from '@/data/events'
import { communities as fallbackCommunities } from '@/data/communities'
import { videos as fallbackVideos } from '@/data/videos'
import styles from './home.module.css'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function SlotMachineName({ name }: { name: string }) {
  const [displayed, setDisplayed] = useState(() => name.split(''))
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return

    const totalDuration = 1000
    const settlDelay = 120
    const tickInterval = 45
    const timers: ReturnType<typeof setTimeout>[] = []

    name.split('').forEach((char, i) => {
      const startTime = i * settlDelay
      let ticks = 0
      const maxTicks = Math.floor((totalDuration - startTime) / tickInterval)

      const run = () => {
        if (ticks < maxTicks) {
          setDisplayed(prev => {
            const next = [...prev]
            next[i] = CHARS[Math.floor(Math.random() * CHARS.length)]
            return next
          })
          ticks++
          timers.push(setTimeout(run, tickInterval))
        } else {
          setDisplayed(prev => {
            const next = [...prev]
            next[i] = char
            return next
          })
        }
      }

      timers.push(setTimeout(run, startTime))
    })

    return () => timers.forEach(clearTimeout)
  }, [name, mounted])

  return <>{displayed.join('')}</>
}

function CommunityLogo({ type, handle, logo_url }: { type: string; handle: string; logo_url?: string }) {
  const slug = handle.slice(1)
  const src = logo_url || `/logos/${type}s/${slug}.png`
  const [failed, setFailed] = useState(false)

  if (!failed) {
    return (
      <Image
        src={src}
        alt={handle}
        width={36}
        height={36}
        className={styles.logoImg}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className={styles.logoFallback}>
      {handle.slice(1, 3).toUpperCase()}
    </div>
  )
}

function DashboardInner() {
  const { user, profileName, loading: authLoading, refreshProfile } = useAuth()
  const router    = useRouter()
  const firstName = (!authLoading && profileName) ? profileName.split(' ')[0] : ''

  const [events, setEvents] = useState<typeof fallbackEvents>(fallbackEvents)
  const [communities, setCommunities] = useState<typeof fallbackCommunities>(fallbackCommunities)
  const [videos, setVideos] = useState<typeof fallbackVideos>(fallbackVideos)

  useEffect(() => {
    supabase.from('events').select('*').order('created_at').then(({ data }) => { if (data?.length) setEvents(data as typeof fallbackEvents) })
    supabase.from('communities').select('*').order('created_at').then(({ data }) => { if (data?.length) setCommunities(data as typeof fallbackCommunities) })
    supabase.from('videos').select('*').order('created_at').then(({ data }) => { if (data?.length) setVideos(data as typeof fallbackVideos) })
  }, [])

  const [blurVisible,        setBlurVisible]        = useState(true)
  const [showUsernameModal,  setShowUsernameModal]  = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading) setBlurVisible(false)
  }, [authLoading])

  // If user is logged in but never picked a username, prompt them
  useEffect(() => {
    if (authLoading || !user) return
    supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (!data || !data.username) setShowUsernameModal(true) })
  }, [authLoading, user])

  // Remove filter entirely once transition ends — keeps position:fixed children
  // (ProfileModal etc.) out of the filter stacking context
  useEffect(() => {
    if (blurVisible) return
    const el = pageRef.current
    if (!el) return
    const onEnd = () => { el.style.filter = ''; el.style.transition = '' }
    el.addEventListener('transitionend', onEnd, { once: true })
    return () => el.removeEventListener('transitionend', onEnd)
  }, [blurVisible])

  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (events.length <= 1) return
    const id = setInterval(() => setSlide(s => (s + 1) % events.length), 15000)
    return () => clearInterval(id)
  }, [events.length])
  const [search, setSearch] = useState('')
  const [registerEvent, setRegisterEvent] = useState<typeof fallbackEvents[0] | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true)
    }
    if (searchParams.get('setup') === 'username') {
      setShowUsernameModal(true)
    }
    if (searchParams.get('welcome') || searchParams.get('setup')) {
      window.history.replaceState({}, '', '/home')
    }
  }, [searchParams])

  const filtered = useMemo(() =>
    communities.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase())
    ),
  [communities, search])

  return (
    <>
    {blurVisible && (
      <div className={styles.loadingSpinner}>
        <div className={styles.spinnerRing} />
      </div>
    )}
    <div
      ref={pageRef}
      className={styles.page}
      style={{
        filter:     blurVisible ? 'blur(10px)' : 'blur(0px)',
        transition: 'filter 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >

      {/* ── NAV ── */}
      <AppNav active="home" />

      {/* ── EVENTS ── */}
      <section className={styles.section}>
        <div className={`${styles.welcomeRow} ${styles.fadeUp} ${styles.delay1}`}>
          <p className={styles.welcomeText}>Welcome back, <strong><SlotMachineName name={firstName} /></strong></p>
          <h2 className={styles.sectionTitle}>Events</h2>
        </div>

        <div className={`${styles.eventCarousel} ${styles.fadeIn} ${styles.delay2}`}>
          {events.map((event, i) => i !== slide ? null : (
            <div key={event.id} className={`${styles.eventCard} ${styles[event.color]}`}>
              <div className={styles.eventImg} style={event.image_url ? { backgroundImage: `url(${event.image_url})`, backgroundSize: 'cover', backgroundPosition: event.image_position || '50% 50%' } : undefined} />
              <div className={styles.eventOverlay} />
              <div className={styles.eventContent}>
                <div className={styles.eventContentInner}>
                  <div>
                    <h3 className={styles.eventName}>{event.name}</h3>
                    <div className={styles.eventMeta}>
                      <span className={styles.eventDate}>{event.date}</span>
                      <span className={styles.dot}>·</span>
                      <span className={styles.eventLoc}>{event.location}</span>
                    </div>
                  </div>
                  <div className={styles.eventBtns}>
                    <button className={styles.learnMoreBtn} onClick={() => router.push(`/events/${event.id}`)}>Learn more</button>
                    <button className={styles.registerBtn} onClick={() => setRegisterEvent(event)}>Register →</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            className={`${styles.slideArrow} ${styles.slideArrowLeft}`}
            onClick={() => setSlide(s => Math.max(0, s - 1))}
            style={{ opacity: slide === 0 ? 0.25 : 1 }}
          >‹</button>
          <button
            className={`${styles.slideArrow} ${styles.slideArrowRight}`}
            onClick={() => setSlide(s => Math.min(events.length - 1, s + 1))}
            style={{ opacity: slide === events.length - 1 ? 0.25 : 1 }}
          >›</button>
        </div>

        <div className={`${styles.eventDots} ${styles.fadeIn} ${styles.delay2}`}>
          {events.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot2} ${i === slide ? styles.dotActive : ''}`}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </section>

      {/* ── COMMUNITIES ── */}
      <section className={`${styles.section} ${styles.fadeUp} ${styles.delay3}`}>
        <h2 className={styles.sectionTitle}>Communities</h2>

        <label className={styles.communitySearch}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.communitySearchInput}
          />
        </label>

        <div className={styles.communityCards}>
          {filtered.slice(0, 2).map(c => (
            <div key={c.id} className={styles.communityCard}>
              <div className={`${styles.communityBanner} ${styles[c.banner]}`} style={c.banner_url ? { backgroundImage: `url(${c.banner_url})`, backgroundSize: 'cover', backgroundPosition: c.banner_position || '50% 50%' } : undefined} />
              <div className={styles.verifiedBadge}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Verified</span>
              </div>
              <div className={styles.communityCardLogo}>
                <CommunityLogo type={c.type} handle={c.handle} logo_url={c.logo_url} />
              </div>
              <div className={styles.communityCardBody}>
                <p className={styles.communityCardName}>{c.name}</p>
                <p className={styles.communityCardDesc}>{(c as any).description ?? c.desc}</p>
                <div className={styles.communityCardFooter}>
                  <div className={styles.communityCardMembers}>
                    <span className={styles.memberStat}>
                      <span className={styles.memberDot} />
                      {c.members.toLocaleString()} members
                    </span>
                    <span className={styles.memberDivider}>·</span>
                    <span className={styles.memberStatActive}>
                      <span className={styles.memberDotActive} />
                      {c.active} active today
                    </span>
                  </div>
                  <button className={styles.joinBtn}>Join →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VIDEOS ── */}
      <section className={`${styles.section} ${styles.fadeUp} ${styles.delay4}`}>
        <h2 className={styles.sectionTitle}>Videos</h2>
        <div className={styles.videosGrid}>
          {videos.map(v => (
            <div key={v.id} className={styles.videoCard}>
              <div className={styles.videoThumb}>
                <div className={styles.playBtn}>▶</div>
                <span className={styles.duration}>{v.duration}</span>
              </div>
              <div className={styles.videoInfo}>
                <p className={styles.videoTitle}>{v.title}</p>
                <p className={styles.videoEvent}>{v.speaker} · {v.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.viewAllWrap}>
          <a href="/videos" className={styles.viewAllBtn}>View all →</a>
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

      {showUsernameModal && user && (
        <ChooseUsernameModal
          userId={user.id}
          onDone={() => { setShowUsernameModal(false); refreshProfile() }}
        />
      )}

      {registerEvent && (
        <RegisterModal event={registerEvent} onClose={() => setRegisterEvent(null)} />
      )}

      {showWelcome && (
        <div className={styles.welcomeBackdrop} onClick={() => setShowWelcome(false)}>
          <div className={styles.welcomeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.welcomeEmoji}>🎉</div>
            <h2 className={styles.welcomeModalTitle}>Welcome to mrktr.club</h2>
            <p className={styles.welcomeModalSub}>You're in. Explore events, join communities, and connect with marketers who get it.</p>
            <button className={styles.welcomeModalBtn} onClick={() => setShowWelcome(false)}>
              Let's go →
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default function Dashboard() {
  return (
    <Suspense>
      <ProtectedRoute><DashboardInner /></ProtectedRoute>
    </Suspense>
  )
}
