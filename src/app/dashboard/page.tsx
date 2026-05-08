'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import styles from './dashboard.module.css'

const events = [
  { id: 1, name: 'Bay Area Marketing Summit', date: 'June 14, 2026', location: 'San Francisco, CA', color: 'fromTeal' },
  { id: 2, name: 'Brand Strategy Keynote',    date: 'June 28, 2026', location: 'Virtual',           color: 'fromBlue' },
  { id: 3, name: 'SJSU Marketing Mixer',      date: 'July 10, 2026', location: 'San Jose, CA',      color: 'fromPurple' },
]

const communities = [
  { id: 1,  type: 'school',  handle: '@sjsu',         name: 'San Jose State University',      members: 142, active: 38,  desc: 'Connect with SJSU marketing students and alumni building careers in the Bay Area.',      banner: 'bannerTeal'   },
  { id: 2,  type: 'school',  handle: '@sfsu',         name: 'San Francisco State University', members: 98,  active: 21,  desc: 'A space for SFSU marketers to share opportunities, projects, and ideas.',           banner: 'bannerBlue'   },
  { id: 3,  type: 'school',  handle: '@csueb',        name: 'CSU East Bay',                   members: 74,  active: 14,  desc: 'East Bay marketing community for students, grads, and faculty.',                        banner: 'bannerPurple' },
  { id: 4,  type: 'school',  handle: '@ucb',          name: 'UC Berkeley',                    members: 89,  active: 27,  desc: 'Berkeley marketers — from Haas to the broader campus community.',                      banner: 'bannerAmber'  },
  { id: 5,  type: 'city',    handle: '@sanjose',      name: 'San Jose',                       members: 318, active: 84,  desc: 'The hub for marketing professionals living and working in San Jose.',                   banner: 'bannerTeal'   },
  { id: 6,  type: 'city',    handle: '@sanfrancisco', name: 'San Francisco',                  members: 276, active: 61,  desc: 'SF-based marketers across startups, agencies, and enterprise.',                        banner: 'bannerBlue'   },
  { id: 7,  type: 'city',    handle: '@fremont',      name: 'Fremont',                        members: 104, active: 19,  desc: 'Local marketing community for Fremont professionals and students.',                     banner: 'bannerPurple' },
  { id: 8,  type: 'city',    handle: '@milpitas',     name: 'Milpitas',                       members: 61,  active: 11,  desc: 'Connecting marketers in Milpitas and the surrounding South Bay.',                      banner: 'bannerAmber'  },
  { id: 9,  type: 'company', handle: '@adobe',        name: 'Adobe',                          members: 63,  active: 17,  desc: 'Adobe employees and alumni sharing marketing insights and career moves.',               banner: 'bannerAmber'  },
  { id: 10, type: 'company', handle: '@paypal',       name: 'PayPal',                         members: 47,  active: 9,   desc: 'PayPal marketers — current team members and a growing alumni network.',                banner: 'bannerBlue'   },
  { id: 11, type: 'company', handle: '@meta',         name: 'Meta',                           members: 88,  active: 24,  desc: 'Meta marketing team members, alumni, and those aspiring to join.',                     banner: 'bannerPurple' },
  { id: 12, type: 'company', handle: '@google',       name: 'Google',                         members: 112, active: 33,  desc: 'Google marketers across teams — brand, growth, product, and beyond.',                  banner: 'bannerTeal'   },
]

const videos = [
  { id: 1, title: 'Brand Positioning in the AI Era',    speaker: 'Sarah Chen',        date: 'Jun 28, 2026', duration: '42:18' },
  { id: 2, title: 'Growth Loops: What Actually Works',  speaker: 'Marcus Williams',   date: 'Jun 14, 2026', duration: '28:05' },
  { id: 3, title: 'Building a Community-Led Brand',     speaker: 'Priya Nair',         date: 'Jun 14, 2026', duration: '35:47' },
  { id: 4, title: 'The Future of Influencer Marketing', speaker: 'Jordan Lee',         date: 'Jul 10, 2026', duration: '19:22' },
  { id: 5, title: 'SEO in 2026: What Changed',          speaker: 'Alex Torres',        date: 'Jul 22, 2026', duration: '51:03' },
  { id: 6, title: 'Paid Ads That Convert',              speaker: 'Megan Park',         date: 'Jul 22, 2026', duration: '38:14' },
]

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

export default function Dashboard() {
  const [slide, setSlide] = useState(0)
  const [search, setSearch] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const ROW_H = 81
  const [profileOpen, setProfileOpen] = useState(false)

  const filtered = useMemo(() =>
    communities.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase())
    ),
  [search])

  return (
    <div className={styles.page}>


      {/* ── NAV ── */}
      <nav className={`${styles.topNav} ${styles.fadeUp} ${styles.delay0}`}>
        <a href="/dashboard" className={styles.topNavLogo}>mrktr.club</a>
        <div className={styles.topNavLinks}>
          <a href="/dashboard" className={`${styles.topNavLink} ${styles.topNavLinkActive}`}>Home</a>
          <a href="/dashboard" className={styles.topNavLink}>Events</a>
          <a href="/dashboard" className={styles.topNavLink}>Communities</a>
          <a href="/dashboard" className={styles.topNavLink}>Videos</a>
        </div>
        <div className={styles.topNavSpacer} />
      </nav>

      {/* ── EVENTS ── */}
      <section className={styles.section}>
        <div className={`${styles.welcomeRow} ${styles.fadeUp} ${styles.delay1}`}>
          <div>
            <p className={styles.welcomeText}>Welcome back, <strong><SlotMachineName name="Anmol" /></strong></p>
            <h2 className={styles.sectionTitle}>Events</h2>
          </div>
          <div className={styles.profileWidgetWrap}>
            <div className={styles.profileWidget} onClick={() => setProfileOpen(o => !o)}>
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: profileOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}
              ><polyline points="6 9 12 15 18 9"/></svg>
              <div className={styles.profileAvatar}>A</div>
            </div>

            {profileOpen && (
              <div className={styles.profileDropdown}>
                <a href="#" className={styles.dropdownItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </a>
                <a href="#" className={styles.dropdownItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </a>
                <a href="#" className={styles.dropdownItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Invite Friends
                </a>
                <a href="#" className={styles.dropdownItem}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Help
                </a>
                <div className={styles.dropdownDivider} />
                <a href="#" className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Log out
                </a>
              </div>
            )}
          </div>
        </div>

        <div className={`${styles.eventCarousel} ${styles.fadeUp} ${styles.delay2}`}>
          <div className={styles.eventTrack} style={{ transform: `translateX(-${slide * 100}%)` }}>
            {events.map(event => (
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
          </div>

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

        <div className={`${styles.eventDots} ${styles.fadeUp} ${styles.delay2}`}>
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
          <button className={styles.viewAllBtn}>View all videos →</button>
        </div>
      </section>

      <div className={styles.footerDivider} />

      <footer className={styles.footer}>
        <a href="/terms" className={styles.footerLink}>Terms of Service</a>
        <div className={styles.footerDot} />
        <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
        <div className={styles.footerDot} />
        <a href="/contact" className={styles.footerLink}>Contact</a>
      </footer>

    </div>
  )
}
