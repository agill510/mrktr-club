'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import ProfileModal, { ProfileSection } from './ProfileModal'
import styles from './AppNav.module.css'

type ActivePage = 'home' | 'events' | 'communities' | 'videos'

export default function AppNav({ active }: { active: ActivePage }) {
  const { profileName, avatarUrl, loading: authLoading } = useAuth()
  const router = useRouter()

  const [profileOpen,  setProfileOpen]  = useState(false)
  const [modalSection, setModalSection] = useState<ProfileSection | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const firstName = (!authLoading && profileName) ? profileName.split(' ')[0] : ''
  const initial   = firstName.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    setProfileOpen(false)
    await supabase.auth.signOut()
    router.replace('/')
  }

  const openModal = (section: ProfileSection) => {
    setProfileOpen(false)
    setModalSection(section)
  }

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

  return (
    <>
      <nav className={`${styles.topNav} ${styles.fadeUp} ${styles.delay0}`}>
      <div className={styles.topNavInner}>
        <a href="/home" className={styles.topNavLogo}>mrktr.club</a>

        <div className={styles.topNavLinks}>
          <a href="/home"   className={`${styles.topNavLink} ${active === 'home'        ? styles.topNavLinkActive : ''}`}>Home</a>
          <a href="/events"      className={`${styles.topNavLink} ${active === 'events'      ? styles.topNavLinkActive : ''}`}>Events</a>
          <a href="/communities" className={`${styles.topNavLink} ${active === 'communities' ? styles.topNavLinkActive : ''}`}>Communities</a>
          <a href="/videos"      className={`${styles.topNavLink} ${active === 'videos'      ? styles.topNavLinkActive : ''}`}>Videos</a>
        </div>

        <div className={styles.profileWidgetWrap} ref={profileRef}>
          <div className={styles.profileWidget} onClick={() => setProfileOpen(o => !o)}>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: profileOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}
            ><polyline points="6 9 12 15 18 9"/></svg>
            <div className={styles.profileAvatar}>
              {avatarUrl
                ? <Image src={avatarUrl} alt={firstName || 'avatar'} width={36} height={36} style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }} />
                : (initial || '…')
              }
            </div>
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
      </nav>

      {modalSection && (
        <ProfileModal initial={modalSection} onClose={() => setModalSection(null)} />
      )}
    </>
  )
}
