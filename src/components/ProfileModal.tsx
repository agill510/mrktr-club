'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import styles from './ProfileModal.module.css'

export type ProfileSection = 'profile' | 'settings' | 'invite' | 'help'

function toSlug(name: string): string {
  const parts = name.trim().toLowerCase().split(/\s+/)
  const first2 = (parts[0] ?? '').slice(0, 2)
  const last   = parts[1] ?? ''
  return (first2 + last).replace(/[^a-z0-9]/g, '')
}

const NAV_ITEMS: { id: ProfileSection; label: string; icon: React.ReactNode }[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  {
    id: 'invite',
    label: 'Invite Friends',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    id: 'help',
    label: 'Help',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
]

function ProfileContent() {
  const { refreshProfile } = useAuth()
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [bio,       setBio]       = useState('')
  const [username,       setUsername]       = useState('')
  const [avatarUrl,      setAvatarUrl]      = useState('')
  const [bannerUrl,      setBannerUrl]      = useState('')
  const [bannerPosY,     setBannerPosY]     = useState(50)
  const [draggingBanner, setDraggingBanner] = useState(false)
  const [showDragHint,   setShowDragHint]   = useState(false)
  const [positionDirty,  setPositionDirty]  = useState(false)
  const [savingPos,      setSavingPos]      = useState(false)
  const [bannerProgress, setBannerProgress] = useState(0)
  const [avatarProgress, setAvatarProgress] = useState(0)
  const [userId,         setUserId]         = useState<string | null>(null)
  const bannerTickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const avatarTickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startProgress = (setter: (v: number) => void, tickRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) => {
    setter(1)
    let cur = 1
    tickRef.current = setInterval(() => {
      cur += (84 - cur) * 0.06
      setter(Math.min(cur, 84))
    }, 80)
  }

  const finishProgress = (setter: (v: number) => void, tickRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) => {
    if (tickRef.current) clearInterval(tickRef.current)
    setter(100)
    setTimeout(() => setter(0), 700)
  }
  const dragRef     = useRef<{ startY: number; startPos: number } | null>(null)
  const posYRef     = useRef(50)
  const userIdRef   = useRef<string | null>(null)
  useEffect(() => { posYRef.current   = bannerPosY }, [bannerPosY])
  useEffect(() => { userIdRef.current = userId },     [userId])
  const [saved,     setSaved]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email ?? '')
      const { data } = await supabase.from('profiles').select('name, bio, username, avatar_url, banner_url, banner_position_y').eq('id', user.id).single()
      if (data) {
        setName(data.name ?? '')
        setBio(data.bio ?? '')
        setUsername(data.username ?? '')
        setAvatarUrl(data.avatar_url ?? '')
        setBannerUrl(data.banner_url ?? '')
        setBannerPosY(data.banner_position_y ?? 50)
      }
    }
    load()
  }, [])

  // Vertical-only drag to reposition banner
  useEffect(() => {
    if (!draggingBanner) return
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const dy = e.clientY - d.startY
      setBannerPosY(Math.max(0, Math.min(100, d.startPos - dy * 0.4)))
    }
    const onUp = () => {
      setDraggingBanner(false)
      setShowDragHint(false)
      setPositionDirty(true)
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [draggingBanner])

  const onBannerMouseDown = (e: React.MouseEvent) => {
    if (!bannerUrl || !showDragHint) return
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startPos: bannerPosY }
    setDraggingBanner(true)
  }

  const upload = async (file: File, folder: string): Promise<string | null> => {
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${folder}/${Date.now()}.${ext}`
    const { error: err } = await supabase.storage.from('admin-media').upload(path, file, { upsert: true })
    if (err) return null
    const { data: { publicUrl } } = supabase.storage.from('admin-media').getPublicUrl(path)
    return publicUrl
  }

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    startProgress(setAvatarProgress, avatarTickRef)
    const url = await upload(file, `avatars/${userId}`)
    finishProgress(setAvatarProgress, avatarTickRef)
    if (!url) return
    setAvatarUrl(url)
    await supabase.from('profiles').upsert({ id: userId, avatar_url: url, updated_at: new Date().toISOString() })
    refreshProfile()
  }

  const handleBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    startProgress(setBannerProgress, bannerTickRef)
    const url = await upload(file, `banners/${userId}`)
    finishProgress(setBannerProgress, bannerTickRef)
    if (!url) return
    setBannerUrl(url)
    setBannerPosY(50)
    setPositionDirty(false)
    setShowDragHint(true)
    await supabase.from('profiles').upsert({ id: userId, banner_url: url, banner_position_y: 50, updated_at: new Date().toISOString() })
  }

  const saveBannerPosition = async () => {
    if (!userId) return
    setSavingPos(true)
    await supabase.from('profiles').upsert({
      id: userId,
      banner_position_y: Math.round(posYRef.current),
      updated_at: new Date().toISOString(),
    })
    setSavingPos(false)
    setPositionDirty(false)
    setShowDragHint(false)
  }

  const save = async () => {
    if (!userId) { setError('Not logged in'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('profiles').upsert({
      id: userId, name, email, bio,
      avatar_url: avatarUrl || null,
      banner_url: bannerUrl || null,
      banner_position_y: bannerPosY,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setShowDragHint(false)
    setPositionDirty(false)
    refreshProfile()
    setTimeout(() => setSaved(false), 2000)
  }

  const initial = (name || 'A').charAt(0).toUpperCase()

  return (
    <div className={styles.profileWrap}>
      {/* Banner */}
      <div
        className={`${styles.profileBanner} ${showDragHint ? (draggingBanner ? styles.grabbing : styles.grab) : ''}`}
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: `center ${bannerPosY}%` } : undefined}
        onMouseDown={onBannerMouseDown}
      >
        {showDragHint && !draggingBanner && (
          <div className={styles.bannerDragHint}>↕ Drag to reposition</div>
        )}
        {bannerProgress > 0 && (
          <div className={styles.uploadProgress}>
            <div className={`${styles.uploadProgressBar} ${bannerProgress === 100 ? styles.uploadProgressDone : ''}`} style={{ width: `${bannerProgress}%` }} />
          </div>
        )}
        {positionDirty && !draggingBanner && (
          <button className={styles.bannerSavePos} onClick={saveBannerPosition} disabled={savingPos}>
            {savingPos ? 'Saving…' : 'Save position'}
          </button>
        )}
        {!showDragHint && (
          <label className={styles.bannerEdit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBanner} />
          </label>
        )}

        {/* Avatar overlapping banner bottom */}
        <div className={styles.avatarOnBanner}>
          <label className={styles.avatarEditWrap} style={{ position: 'relative' }}>
            {avatarProgress > 0 && (
              <div className={styles.avatarProgress}>
                <div className={styles.avatarProgressBar} style={{ width: `${avatarProgress}%` }} />
              </div>
            )}
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className={styles.bigAvatarImg} />
              : <div className={styles.bigAvatar}>{initial}</div>
            }
            <div className={styles.avatarEditOverlay}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          </label>
        </div>
      </div>

      {/* Fields */}
      <div className={styles.content} style={{ paddingTop: 48 }}>
        <p className={styles.profileName}>{name || ''}</p>
        <p className={styles.profileHandle} style={{ marginBottom: 20 }}>@{username || '—'}</p>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Full name</label>
          <input className={styles.field} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Email</label>
          <input className={styles.field} value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Bio</label>
          <textarea className={`${styles.field} ${styles.textarea}`} value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        {error && <p className={styles.fieldError}>{error}</p>}
        <button className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`} onClick={save} disabled={saving}>
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function SettingsContent() {
  return (
    <div className={styles.content}>
      <p className={styles.contentTitle}>Notifications</p>
      {['Event reminders', 'New community members', 'Weekly digest', 'Direct messages'].map(label => (
        <div key={label} className={styles.toggleRow}>
          <span className={styles.toggleLabel}>{label}</span>
          <div className={`${styles.toggle} ${styles.toggleOn}`} />
        </div>
      ))}
      <p className={`${styles.contentTitle} ${styles.contentTitleSpaced}`}>Privacy</p>
      {['Show profile to members', 'Allow direct messages'].map(label => (
        <div key={label} className={styles.toggleRow}>
          <span className={styles.toggleLabel}>{label}</span>
          <div className={`${styles.toggle} ${styles.toggleOn}`} />
        </div>
      ))}
    </div>
  )
}

function InviteContent() {
  const [username, setUsername] = useState('')
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('username').eq('id', user.id).single()
        .then(({ data }) => { if (data?.username) setUsername(data.username) })
    })
  }, [])

  const link = username ? `mrktr.club/invite/${username}` : 'mrktr.club/invite/...'

  const copy = () => {
    navigator.clipboard.writeText(`https://${link}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.content}>
      <p className={styles.contentTitle}>Your invite link</p>
      <p className={styles.contentDesc}>Share this link with fellow marketers to invite them to mrktr.club.</p>
      <div className={styles.inviteRow}>
        <span className={styles.inviteLink}>{link}</span>
        <button className={styles.copyBtn} onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
      </div>
      <div className={styles.inviteStats}>
        <div className={styles.inviteStat}>
          <span className={styles.inviteStatNum}>0</span>
          <span className={styles.inviteStatLabel}>Invited</span>
        </div>
        <div className={styles.inviteStat}>
          <span className={styles.inviteStatNum}>0</span>
          <span className={styles.inviteStatLabel}>Joined</span>
        </div>
      </div>
    </div>
  )
}

function HelpContent() {
  return (
    <div className={styles.content}>
      <p className={styles.contentTitle}>Frequently asked</p>
      {[
        ['What is mrktr.club?', 'A private community for marketing students, alumni, and professionals in the Bay Area.'],
        ['How do I join a community?', 'Browse the Communities page and click Join on any community that interests you.'],
        ['How do I register for an event?', 'Visit the Events page and click Register on any upcoming event.'],
        ['How do I contact support?', 'Email us at hello@mrktr.club and we\'ll get back to you within 24 hours.'],
      ].map(([q, a]) => (
        <div key={q} className={styles.faqItem}>
          <p className={styles.faqQ}>{q}</p>
          <p className={styles.faqA}>{a}</p>
        </div>
      ))}
    </div>
  )
}

function renderSection(section: ProfileSection): React.ReactNode {
  switch (section) {
    case 'profile':  return <ProfileContent />
    case 'settings': return <SettingsContent />
    case 'invite':   return <InviteContent />
    case 'help':     return <HelpContent />
  }
}

export default function ProfileModal({ initial, onClose }: { initial: ProfileSection; onClose: () => void }) {
  const [active, setActive] = useState<ProfileSection>(initial)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.overlay} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <div className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Account</p>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${active === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActive(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className={styles.sidebarDivider} />
          <button className={`${styles.navItem} ${styles.navItemDanger}`} onClick={() => supabase.auth.signOut()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <p className={styles.panelTitle}>{NAV_ITEMS.find(i => i.id === active)?.label}</p>
            <button className={styles.closeBtn} onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {renderSection(active)}
        </div>
      </div>
    </div>
  )
}
