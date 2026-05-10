'use client'

import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import AppNav from '@/components/AppNav'
import ProfileModal, { ProfileSection } from '@/components/ProfileModal'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { events as fallbackEvents } from '@/data/events'
import { communities as fallbackCommunities } from '@/data/communities'
import { videos as fallbackVideos } from '@/data/videos'
import styles from './dashboard.module.css'

type TypeFilter = 'all' | 'school' | 'city' | 'company'

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

function CommunityLogo({ type, handle }: { type: string; handle: string }) {
  const slug = handle.slice(1)
  const src = `/logos/${type}s/${slug}.png`
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
  const { profileName } = useAuth()
  const router    = useRouter()
  const firstName = profileName.split(' ')[0] || 'there'
  const initial   = firstName.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const [events, setEvents] = useState<typeof fallbackEvents>(fallbackEvents)
  const [communities, setCommunities] = useState<typeof fallbackCommunities>(fallbackCommunities)
  const [videos, setVideos] = useState<typeof fallbackVideos>(fallbackVideos)

  useEffect(() => {
    supabase.from('events').select('*').order('created_at').then(({ data }) => { if (data?.length) setEvents(data as typeof fallbackEvents) })
    supabase.from('communities').select('*').order('created_at').then(({ data }) => { if (data?.length) setCommunities(data as typeof fallbackCommunities) })
    supabase.from('videos').select('*').order('created_at').then(({ data }) => { if (data?.length) setVideos(data as typeof fallbackVideos) })
  }, [])

  const [slide, setSlide] = useState(0)
  const [search, setSearch] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true)
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])
  const [modalSection, setModalSection] = useState<ProfileSection | null>(null)

  const openModal = (section: ProfileSection) => {
    setProfileOpen(false)
    setModalSection(section)
  }
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

  const filtered = useMemo(() =>
    communities.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase())
    ),
  [search])

  return (
    <div className={styles.page}>


      {/* ── NAV ── */}
      <AppNav active="home" showProfile={false} />

      {/* ── EVENTS ── */}
      <section className={styles.section}>
        <div className={`${styles.welcomeRow} ${styles.fadeUp} ${styles.delay1}`}>
          <div>
            <p className={styles.welcomeText}>Welcome back, <strong><SlotMachineName name={firstName} /></strong></p>
            <h2 className={styles.sectionTitle}>Events</h2>
          </div>
          <div className={styles.profileWidgetWrap} ref={profileRef}>
            <div className={styles.profileWidget} onClick={() => setProfileOpen(o => !o)}>
              <div className={styles.profileAvatar}>{initial}</div>
            </div>
            {profileOpen && (
              <div className={styles.profileDropdown}>
                <button className={styles.dropdownItem} onClick={() => openModal('profile')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </button>
                <button className={styles.dropdownItem} onClick={() => openModal('settings')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </button>
                <button className={styles.dropdownItem} onClick={() => openModal('invite')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Invite Friends
                </button>
                <button className={styles.dropdownItem} onClick={() => openModal('help')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Help
                </button>
                <div className={styles.dropdownDivider} />
                <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleSignOut}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`${styles.eventCarousel} ${styles.fadeIn} ${styles.delay2}`}>
          {events.map((event, i) => i !== slide ? null : (
            <div key={event.id} className={`${styles.eventCard} ${styles[event.color]}`}>
              <div className={styles.eventImg} />
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
                    <button className={styles.learnMoreBtn}>Learn more</button>
                    <button className={styles.registerBtn}>Register →</button>
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
              <div className={`${styles.communityBanner} ${styles[c.banner]}`} />
              <div className={styles.verifiedBadge}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Verified</span>
              </div>
              <div className={styles.communityCardLogo}>
                <CommunityLogo type={c.type} handle={c.handle} />
              </div>
              <div className={styles.communityCardBody}>
                <p className={styles.communityCardName}>{c.name}</p>
                <p className={styles.communityCardDesc}>{c.desc}</p>
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
        <a href="/dashboard" className={styles.footerLogo}>mrktr.club</a>
        <div className={styles.footerLinks}>
          <a href="/terms"   className={styles.footerLink}>Terms of Service</a>
          <div className={styles.footerDot} />
          <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
          <div className={styles.footerDot} />
          <a href="/contact" className={styles.footerLink}>Contact</a>
        </div>
      </footer>

      {modalSection && (
        <ProfileModal initial={modalSection} onClose={() => setModalSection(null)} />
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
  )
}

export default function Dashboard() {
  return (
    <Suspense>
      <ProtectedRoute><DashboardInner /></ProtectedRoute>
    </Suspense>
  )
}
