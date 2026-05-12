'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import AppNav from '@/components/AppNav'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import styles from './community.module.css'

// ── Types ────────────────────────────────────────────────
interface Community { id: string; name: string; description?: string; banner_url?: string; banner_position?: string; type: string; handle: string }
interface Channel    { id: string; name: string; description?: string; is_private: boolean; position: number }
interface Profile    { name: string; username?: string; avatar_url?: string }
interface Message    { id: string; channel_id: string; user_id: string; content: string; is_edited: boolean; is_deleted: boolean; created_at: string; profiles?: Profile }
interface Member     { id: string; user_id: string; role: string; is_muted: boolean; joined_at: string; profiles?: Profile; is_online?: boolean }

// ── Constants ────────────────────────────────────────────
const BLOCKED = ['nigger','faggot','vagina','pussy','slut','whore','cunt','chink','retard','tranny']
const BATCH = 30
const HEARTBEAT_MS = 20000
const SPAM_WINDOW = 15000
const SPAM_MAX = 10
const HEAVY_WINDOW = 60000
const HEAVY_MAX = 50
const COOLDOWN_S = 45

const blocked = (t: string) => BLOCKED.some(w => t.toLowerCase().includes(w))

function fmt(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Avatar({ profile, size = 32 }: { profile?: Profile; size?: number }) {
  const [failed, setFailed] = useState(false)
  const initial = (profile?.name || '?').charAt(0).toUpperCase()
  if (profile?.avatar_url && !failed)
    return <Image src={profile.avatar_url} alt={initial} width={size} height={size} style={{ borderRadius: '50%', objectFit: 'cover', width: size, height: size, flexShrink: 0 }} onError={() => setFailed(true)} />
  return <div className={styles.avatarInitial} style={{ width: size, height: size, fontSize: size * 0.4 }}>{initial}</div>
}

// ── Main Page ─────────────────────────────────────────────
function CommunityInner() {
  const { id } = useParams() as { id: string }
  const router  = useRouter()
  const { user } = useAuth()

  const [community,      setCommunity]      = useState<Community | null>(null)
  const [channels,       setChannels]       = useState<Channel[]>([])
  const [activeChannel,  setActiveChannel]  = useState<Channel | null>(null)
  const [messages,       setMessages]       = useState<Message[]>([])
  const [members,        setMembers]        = useState<Member[]>([])
  const [isMember,       setIsMember]       = useState(false)
  const [myRole,         setMyRole]         = useState('member')
  const [isMuted,        setIsMuted]        = useState(false)
  const [loading,        setLoading]        = useState(true)
  const [loadingMsgs,    setLoadingMsgs]    = useState(false)
  const [hasMore,        setHasMore]        = useState(true)
  const [input,          setInput]          = useState('')
  const [sending,        setSending]        = useState(false)
  const [spamError,      setSpamError]      = useState('')
  const [cooldown,       setCooldown]       = useState(0)
  const [editingId,      setEditingId]      = useState<string | null>(null)
  const [editText,       setEditText]       = useState('')
  const [memberSearch,   setMemberSearch]   = useState('')
  const [leftExpanded,   setLeftExpanded]   = useState(true)
  const [rightExpanded,  setRightExpanded]  = useState(true)
  const [unreadMentions, setUnreadMentions] = useState(0)
  const [hoveredMember,  setHoveredMember]  = useState<Member | null>(null)
  const [myProfile,      setMyProfile]      = useState<Profile | null>(null)
  const [uploading,      setUploading]      = useState(false)
  const attachRef = useRef<HTMLInputElement>(null)

  const msgTimesRef   = useRef<number[]>([])
  const bottomRef     = useRef<HTMLDivElement>(null)
  const chatRef       = useRef<HTMLDivElement>(null)
  const realtimeRef   = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const heartbeatRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const oldestMsgRef  = useRef<string | null>(null)

  // ── Load own profile ─────────────────────────────────
  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('name, username, avatar_url').eq('id', user.id).single()
      .then(({ data }) => { if (data) setMyProfile(data as Profile) })
  }, [user])

  // ── Load community ────────────────────────────────────
  useEffect(() => {
    if (!id || !user) return
    const init = async () => {
      const [{ data: comm }, { data: mem }] = await Promise.all([
        supabase.from('communities').select('*').eq('id', id).single(),
        supabase.from('community_members').select('*').eq('community_id', id).eq('user_id', user.id).maybeSingle(),
      ])
      if (!comm) { router.replace('/communities'); return }
      setCommunity(comm)
      if (mem) { setIsMember(true); setMyRole(mem.role); setIsMuted(mem.is_muted) }

      // Load channels
      const { data: chs } = await supabase.from('channels').select('*').eq('community_id', id).order('position')
      const list = chs ?? []

      // Auto-create #chat if none exist
      if (list.length === 0 && mem?.role === 'admin') {
        const { data: def } = await supabase.from('channels').insert({ community_id: id, name: 'chat', position: 0 }).select().single()
        if (def) { setChannels([def]); setActiveChannel(def) }
      } else if (list.length === 0) {
        setChannels([])
      } else {
        setChannels(list)
        setActiveChannel(list[0])
      }

      setLoading(false)
    }
    init()
  }, [id, user, router])

  // ── Load members (two-step: no FK required) ──────────
  const loadMembers = useCallback(async () => {
    if (!id) return
    const { data: rows } = await supabase.from('community_members').select('*').eq('community_id', id)
    if (!rows) return

    const userIds = rows.map(m => m.user_id)
    if (userIds.length === 0) { setMembers([]); return }
    const [{ data: profs }, { data: presence }] = await Promise.all([
      supabase.from('profiles').select('id, name, username, avatar_url').in('id', userIds),
      supabase.from('user_presence').select('user_id, is_online, last_seen').in('user_id', userIds),
    ])
    const profMap     = Object.fromEntries((profs     ?? []).map(p => [p.id,      p]))
    const presenceMap = Object.fromEntries((presence  ?? []).map(p => [p.user_id, p]))

    const withStatus = rows.map(m => ({
      ...m,
      profiles: profMap[m.user_id] ?? null,
      is_online: presenceMap[m.user_id]?.is_online && new Date(presenceMap[m.user_id]?.last_seen).getTime() > Date.now() - 60000,
    }))
    withStatus.sort((a, b) => {
      const order: Record<string, number> = { admin: 0, moderator: 1, member: 2 }
      return (order[a.role] ?? 3) - (order[b.role] ?? 3)
    })
    setMembers(withStatus)
  }, [id])

  useEffect(() => {
    loadMembers()
    if (!id) return
    const sub = supabase.channel(`members:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_members', filter: `community_id=eq.${id}` }, loadMembers)
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [id, loadMembers])

  // ── Load messages (two-step: messages then profiles) ──
  const loadMessages = useCallback(async (channelId: string, before?: string) => {
    setLoadingMsgs(true)
    let q = supabase.from('messages').select('*').eq('channel_id', channelId).order('created_at', { ascending: false }).limit(BATCH)
    if (before) q = q.lt('created_at', before)
    const { data: rows } = await q
    setLoadingMsgs(false)
    if (!rows) return

    // Fetch profiles for message authors
    const uids = [...new Set(rows.map(r => r.user_id))]
    const { data: profs } = uids.length
      ? await supabase.from('profiles').select('id, name, username, avatar_url').in('id', uids)
      : { data: [] }
    const profMap = Object.fromEntries((profs ?? []).map(p => [p.id, p]))
    const withProfiles = rows.map(r => ({ ...r, profiles: profMap[r.user_id] ?? null })).reverse()

    if (before) {
      setMessages(prev => [...withProfiles, ...prev])
    } else {
      setMessages(withProfiles)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50)
    }
    if (withProfiles.length > 0) oldestMsgRef.current = withProfiles[0].created_at
    setHasMore(rows.length === BATCH)
  }, [])

  useEffect(() => {
    if (!activeChannel) return
    setMessages([])
    setHasMore(true)
    oldestMsgRef.current = null
    loadMessages(activeChannel.id)

    // Mark mentions read
    if (user) {
      supabase.from('mentions').update({ is_read: true }).eq('channel_id', activeChannel.id).eq('user_id', user.id).eq('is_read', false).then()
      setUnreadMentions(0)
    }

    // Real-time
    realtimeRef.current?.unsubscribe()
    realtimeRef.current = supabase
      .channel(`chat:${activeChannel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel.id}` }, async (payload) => {
        const row = payload.new as Message
        // Skip if we already added this message optimistically (same id)
        setMessages(prev => {
          if (prev.some(m => m.id === row.id)) return prev
          return prev
        })
        // Fetch the profile for the new message author
        const { data: prof } = await supabase.from('profiles').select('name, username, avatar_url').eq('id', row.user_id).single()
        const fullMsg: Message = { ...row, profiles: prof ?? undefined }
        setMessages(prev => {
          if (prev.some(m => m.id === fullMsg.id)) {
            return prev.map(m => m.id === fullMsg.id ? fullMsg : m)
          }
          return [...prev, fullMsg]
        })
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel.id}` }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
      })
      .subscribe()
    return () => { realtimeRef.current?.unsubscribe() }
  }, [activeChannel, loadMessages, user])

  // ── Unread mentions count ─────────────────────────────
  useEffect(() => {
    if (!user || !id) return
    supabase.from('mentions').select('id', { count: 'exact' }).eq('user_id', user.id).eq('community_id', id).eq('is_read', false)
      .then(({ count }) => setUnreadMentions(count ?? 0))
  }, [user, id])

  // ── Heartbeat ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const beat = () => supabase.from('user_presence').upsert({ user_id: user.id, is_online: true, last_seen: new Date().toISOString() })
    beat()
    heartbeatRef.current = setInterval(beat, HEARTBEAT_MS)
    const off = () => supabase.from('user_presence').upsert({ user_id: user.id, is_online: false, last_seen: new Date().toISOString() })
    window.addEventListener('beforeunload', off)
    return () => { clearInterval(heartbeatRef.current!); window.removeEventListener('beforeunload', off); off() }
  }, [user])

  // ── Cooldown timer ────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return
    cooldownTimer.current = setInterval(() => setCooldown(c => { if (c <= 1) { clearInterval(cooldownTimer.current!); return 0 } return c - 1 }), 1000)
    return () => clearInterval(cooldownTimer.current!)
  }, [cooldown > 0])

  // ── Infinite scroll ───────────────────────────────────
  const onScroll = useCallback(() => {
    const el = chatRef.current
    if (!el || !hasMore || loadingMsgs || !activeChannel || !oldestMsgRef.current) return
    if (el.scrollTop < 120) loadMessages(activeChannel.id, oldestMsgRef.current)
  }, [hasMore, loadingMsgs, activeChannel, loadMessages])

  // ── Send message ──────────────────────────────────────
  const send = async () => {
    if (!input.trim() || !activeChannel || !user || sending) return
    const text = input.trim()

    if (isMuted) { setSpamError('You are muted in this community.'); return }

    if (blocked(text)) { setSpamError('Your message contains a word not allowed here.'); return }

    if (cooldown > 0) { setSpamError(`Cooldown active — wait ${cooldown}s.`); return }

    const now = Date.now()
    const recent15 = msgTimesRef.current.filter(t => now - t < SPAM_WINDOW)
    const recent60 = msgTimesRef.current.filter(t => now - t < HEAVY_WINDOW)

    if (recent60.length >= HEAVY_MAX) {
      setCooldown(COOLDOWN_S)
      setSpamError(`You've been sending too many messages. Cooldown: ${COOLDOWN_S}s.`)
      return
    }
    if (recent15.length >= SPAM_MAX) {
      setSpamError("You're sending too fast. Slow down a bit.")
      return
    }

    msgTimesRef.current = [...msgTimesRef.current.filter(t => now - t < HEAVY_WINDOW), now]
    setSpamError('')
    setSending(true)
    setInput('')

    // Optimistic update — show message immediately
    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId, channel_id: activeChannel.id, user_id: user.id,
      content: text, is_edited: false, is_deleted: false,
      created_at: new Date().toISOString(), profiles: myProfile ?? undefined,
    }
    setMessages(prev => [...prev, optimistic])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30)

    const { data: msg } = await supabase.from('messages').insert({
      channel_id: activeChannel.id,
      user_id: user.id,
      content: text,
    }).select().single()

    // Replace temp with real message (keeps id stable for dedup)
    if (msg) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: msg.id, created_at: msg.created_at } : m))
    } else {
      // Insert failed — remove optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setSpamError('Failed to send message. Please try again.')
      setSending(false)
      return
    }

    if (msg) {
      // Parse mentions
      const mentionUsernames = [...text.matchAll(/@(\w+)/g)].map(m => m[1])
      const isEveryone = text.includes('@everyone')

      if (isEveryone) {
        const targets = members.filter(m => m.user_id !== user.id)
        if (targets.length) {
          await supabase.from('mentions').insert(targets.map(m => ({
            user_id: m.user_id, message_id: msg.id, community_id: id, channel_id: activeChannel.id
          })))
        }
      } else if (mentionUsernames.length) {
        const { data: profiles } = await supabase.from('profiles').select('id:id, username').in('username', mentionUsernames)
        const targets = (profiles ?? []).filter((p: any) => p.id !== user.id)
        if (targets.length) {
          await supabase.from('mentions').insert(targets.map((p: any) => ({
            user_id: p.id, message_id: msg.id, community_id: id, channel_id: activeChannel.id
          })))
        }
      }
    }
    setSending(false)
  }

  // ── Edit message ──────────────────────────────────────
  const saveEdit = async (msgId: string) => {
    if (!editText.trim()) return
    await supabase.from('messages').update({ content: editText.trim(), is_edited: true, edited_at: new Date().toISOString() }).eq('id', msgId)
    setEditingId(null); setEditText('')
  }

  // ── Delete message (admin) ────────────────────────────
  const deleteMsg = async (msgId: string) => {
    await supabase.from('messages').update({ is_deleted: true }).eq('id', msgId)
  }

  // ── Join community ────────────────────────────────────
  const join = async () => {
    if (!user) return
    await supabase.from('community_members').upsert({ community_id: id, user_id: user.id, role: 'member' })
    setIsMember(true); setMyRole('member')
    loadMembers()
    if (channels.length === 0) {
      const { data } = await supabase.from('channels').insert({ community_id: id, name: 'chat', position: 0 }).select().single()
      if (data) { setChannels([data]); setActiveChannel(data) }
    }
  }

  // ── Filtered members ──────────────────────────────────
  const filteredMembers = useMemo(() =>
    members.filter(m => !memberSearch || m.profiles?.name?.toLowerCase().includes(memberSearch.toLowerCase()) || m.profiles?.username?.toLowerCase().includes(memberSearch.toLowerCase())),
  [members, memberSearch])

  const onlineMembers  = filteredMembers.filter(m => m.is_online)
  const offlineMembers = filteredMembers.filter(m => !m.is_online)

  // ── File attachment ───────────────────────────────────
  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeChannel || !user) return
    e.target.value = ''

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) { setSpamError('Only .jpg .png .gif .webp .pdf files allowed.'); return }
    if (file.size > 10 * 1024 * 1024) { setSpamError('Max file size is 10 MB.'); return }

    setUploading(true); setSpamError('')
    const ext  = file.name.split('.').pop() ?? 'bin'
    const path = `attachments/${activeChannel.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('admin-media').upload(path, file, { upsert: true })
    setUploading(false)
    if (error) { setSpamError('Upload failed: ' + error.message); return }
    const { data: { publicUrl } } = supabase.storage.from('admin-media').getPublicUrl(path)
    const content = file.type.startsWith('image/')
      ? `[image:${publicUrl}]`
      : `[file:${publicUrl}:${file.name}]`

    // Auto-send as a message
    const tempId = `temp-${Date.now()}`
    const optimistic: Message = { id: tempId, channel_id: activeChannel.id, user_id: user.id, content, is_edited: false, is_deleted: false, created_at: new Date().toISOString(), profiles: myProfile ?? undefined }
    setMessages(prev => [...prev, optimistic])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30)
    const { data: msg } = await supabase.from('messages').insert({ channel_id: activeChannel.id, user_id: user.id, content }).select().single()
    if (msg) setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: msg.id } : m))
    else setMessages(prev => prev.filter(m => m.id !== tempId))
  }

  // ── Render helpers ────────────────────────────────────
  const renderContent = (content: string) => {
    const imgMatch  = content.match(/^\[image:(.+)\]$/)
    const fileMatch = content.match(/^\[file:(.+):(.+)\]$/)
    if (imgMatch)  return <img src={imgMatch[1]}  alt="attachment" className={styles.attachImg} />
    if (fileMatch) return <a href={fileMatch[1]} target="_blank" rel="noopener noreferrer" className={styles.attachFile}>📎 {fileMatch[2]}</a>
    const parts = content.split(/(@\w+)/g)
    return <>{parts.map((p, i) => p.startsWith('@') ? <span key={i} className={styles.mention}>{p}</span> : p)}</>
  }

  if (loading) return (
    <div className={styles.loadingPage}>
      <AppNav active="communities" />
      <div className={styles.loadingCenter}><div className={styles.spinner} /></div>
    </div>
  )

  if (!community) return null

  return (
    <div className={styles.page}>
      <AppNav active="communities" />

      {!isMember ? (
        <div className={styles.joinPrompt}>
          <div className={styles.joinCard}>
            {community.banner_url && <div className={styles.joinBanner} style={{ backgroundImage: `url(${community.banner_url})`, backgroundSize: 'cover', backgroundPosition: community.banner_position || '50% 50%' }} />}
            <div className={styles.joinBody}>
              <h2 className={styles.joinName}>{community.name}</h2>
              {community.description && <p className={styles.joinDesc}>{community.description}</p>}
              <p className={styles.joinCount}>{members.length} member{members.length !== 1 ? 's' : ''}</p>
              <button className={styles.joinBtn} onClick={join}>Join community →</button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.chatWrapper}>
        <div className={styles.layout}>

          {/* ── LEFT SIDEBAR ── */}
          <div className={`${styles.leftSidebar} ${leftExpanded ? styles.expanded : styles.collapsed}`}>
            <div
              className={styles.sidebarHeaderBanner}
              style={community.banner_url ? {
                backgroundImage: `url(${community.banner_url})`,
                backgroundSize: 'cover',
                backgroundPosition: community.banner_position || '50% 50%',
              } : { background: (community as any).banner ? undefined : 'linear-gradient(135deg,#0c4d3d,#12af82)' }}
            >
              <div className={styles.sidebarBannerOverlay} />
              {leftExpanded && (
                <div className={styles.sidebarHeaderContent}>
                  <p className={styles.communityName}>{community.name}</p>
                  <p className={styles.communityHandle}>{community.handle}</p>
                </div>
              )}
              <button className={`${styles.collapseBtn} ${styles.collapseBtnBanner}`} onClick={() => setLeftExpanded(e => !e)}>
                {leftExpanded ? '‹' : '›'}
              </button>
            </div>
            <div className={styles.channelList}>
              <p className={styles.channelGroupLabel}>{leftExpanded ? 'CHANNELS' : '·'}</p>
              {channels.map(ch => (
                <button
                  key={ch.id}
                  className={`${styles.channelItem} ${activeChannel?.id === ch.id ? styles.channelActive : ''}`}
                  onClick={() => setActiveChannel(ch)}
                  title={`#${ch.name}`}
                >
                  <span className={styles.channelHash}>#</span>
                  {leftExpanded && <span className={styles.channelName}>{ch.name}</span>}
                </button>
              ))}
              {channels.length === 0 && leftExpanded && (
                <p className={styles.noChannels}>No channels yet. Create one in the admin panel.</p>
              )}
            </div>
          </div>

          {/* ── CHAT AREA ── */}
          <div className={styles.chatArea}>
            {activeChannel ? (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.chatHeaderLeft}>
                    <span className={styles.chatHash}>#</span>
                    <span className={styles.chatChannelName}>{activeChannel.name}</span>
                    {activeChannel.description && <span className={styles.chatChannelDesc}>{activeChannel.description}</span>}
                  </div>
                  <span className={styles.chatMemberCount}>{members.length} members</span>
                </div>

                <div className={styles.messages} ref={chatRef} onScroll={onScroll}>
                  {loadingMsgs && <div className={styles.loadingMsgs}><div className={styles.spinnerSm} /></div>}
                  {!hasMore && messages.length > 0 && (
                    <p className={styles.beginningMsg}>Beginning of #{activeChannel.name}</p>
                  )}
                  {messages.map((msg, i) => {
                    const prev = messages[i - 1]
                    const grouped = prev && prev.user_id === msg.user_id && new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 300000 && !prev.is_deleted && !msg.is_deleted
                    return (
                      <div key={msg.id} className={`${styles.msgRow} ${grouped ? styles.msgGrouped : ''}`}>
                        {!grouped && (
                          <div className={styles.msgAvatar}><Avatar profile={msg.profiles} /></div>
                        )}
                        {grouped && <div className={styles.msgAvatarSpacer} />}
                        <div className={styles.msgContent}>
                          {!grouped && (
                            <div className={styles.msgMeta}>
                              <span className={styles.msgUsername}>{msg.profiles?.name || 'Unknown'}</span>
                              {msg.profiles?.username && <span className={styles.msgHandle}>@{msg.profiles.username}</span>}
                              <span className={styles.msgTime}>{fmt(msg.created_at)}</span>
                            </div>
                          )}
                          {editingId === msg.id ? (
                            <div className={styles.editRow}>
                              <input className={styles.editInput} value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveEdit(msg.id); if (e.key === 'Escape') { setEditingId(null) } }} autoFocus />
                              <button className={styles.editSave} onClick={() => saveEdit(msg.id)}>Save</button>
                              <button className={styles.editCancel} onClick={() => setEditingId(null)}>Cancel</button>
                            </div>
                          ) : (
                            <div className={styles.msgText}>
                              {msg.is_deleted
                                ? <span className={styles.deletedMsg}>[message deleted]</span>
                                : <>{renderContent(msg.content)}{msg.is_edited && <span className={styles.editedTag}> (edited)</span>}</>
                              }
                            </div>
                          )}
                        </div>
                        {!msg.is_deleted && (
                          <div className={styles.msgActions}>
                            {msg.user_id === user?.id && !msg.is_deleted && (
                              <button className={styles.actionBtn} title="Edit" onClick={() => { setEditingId(msg.id); setEditText(msg.content) }}>✏</button>
                            )}
                            {(myRole === 'admin' || myRole === 'moderator') && (
                              <button className={styles.actionBtn} title="Delete" onClick={() => deleteMsg(msg.id)}>🗑</button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className={styles.inputArea}>
                  {spamError && <div className={styles.spamError}>{spamError}</div>}
                  {cooldown > 0 && <div className={styles.cooldownBar}>Cooldown: {cooldown}s — slow down</div>}
                  <div className={styles.inputRow}>
                    <input
                      ref={attachRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                      style={{ display: 'none' }}
                      onChange={handleAttach}
                    />
                    <input
                      className={styles.msgInput}
                      placeholder={isMuted ? 'You are muted in this community' : `Message #${activeChannel.name}`}
                      value={input}
                      disabled={isMuted || cooldown > 0}
                      onChange={e => { setInput(e.target.value); if (spamError) setSpamError('') }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                      maxLength={2000}
                    />
                    <button className={styles.attachBtn} title="Attach image or file" disabled={isMuted || uploading} onClick={() => attachRef.current?.click()}>
                      {uploading
                        ? <div className={styles.spinnerSm} />
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      }
                    </button>
                    <button className={styles.sendBtn} onClick={send} disabled={!input.trim() || sending || isMuted || cooldown > 0}>
                      ↑
                    </button>
                  </div>
                  <p className={styles.inputHint}>{input.length}/2000 · @mention to notify · Enter to send</p>
                </div>
              </>
            ) : (
              <div className={styles.noChannel}>
                <p>No channels in this community yet.</p>
                {myRole === 'admin' && <p>Create channels from the <a href="/homepage">admin panel</a>.</p>}
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className={`${styles.rightSidebar} ${rightExpanded ? styles.expanded : styles.collapsed}`}>
            <div className={styles.sidebarHeader}>
              <button className={styles.collapseBtn} onClick={() => setRightExpanded(e => !e)}>
                {rightExpanded ? '›' : '‹'}
              </button>
              {rightExpanded && (
                <input
                  className={styles.memberSearch}
                  placeholder="Search members…"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                />
              )}
            </div>

            <div className={styles.memberList}>
              {rightExpanded ? (
                <>
                  {onlineMembers.length > 0 && (
                    <>
                      <p className={styles.memberGroupLabel}>ONLINE — {onlineMembers.length}</p>
                      {onlineMembers.map(m => (
                        <MemberRow key={m.id} member={m} hovered={hoveredMember?.id === m.id} onHover={setHoveredMember} myRole={myRole} communityId={id} onUpdate={() => {}} />
                      ))}
                    </>
                  )}
                  {offlineMembers.length > 0 && (
                    <>
                      <p className={styles.memberGroupLabel}>OFFLINE — {offlineMembers.length}</p>
                      {offlineMembers.map(m => (
                        <MemberRow key={m.id} member={m} hovered={hoveredMember?.id === m.id} onHover={setHoveredMember} myRole={myRole} communityId={id} onUpdate={() => {}} />
                      ))}
                    </>
                  )}
                </>
              ) : (
                <div className={styles.compactAvatars}>
                  {filteredMembers.slice(0, 20).map(m => (
                    <div key={m.id} className={styles.compactMember} title={m.profiles?.name}>
                      <Avatar profile={m.profiles} size={28} />
                      <span className={`${styles.presenceDot} ${m.is_online ? styles.dotOnline : styles.dotOffline}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
        </div>
      )}
    </div>
  )
}

function MemberRow({ member, hovered, onHover, myRole, communityId, onUpdate }: {
  member: Member; hovered: boolean; onHover: (m: Member | null) => void
  myRole: string; communityId: string; onUpdate: () => void
}) {
  const isAdmin = myRole === 'admin'

  const kick = async () => {
    if (!confirm(`Kick ${member.profiles?.name}?`)) return
    await supabase.from('community_members').delete().eq('id', member.id)
    onUpdate()
  }
  const mute = async () => {
    await supabase.from('community_members').update({ is_muted: !member.is_muted }).eq('id', member.id)
    onUpdate()
  }

  return (
    <div className={styles.memberRow} onMouseEnter={() => onHover(member)} onMouseLeave={() => onHover(null)}>
      <div className={styles.memberAvatarWrap}>
        <Avatar profile={member.profiles} size={32} />
        <span className={`${styles.presenceDot} ${member.is_online ? styles.dotOnline : styles.dotOffline}`} />
      </div>
      <div className={styles.memberInfo}>
        <p className={styles.memberName}>{member.profiles?.name || 'Unknown'}</p>
        {member.profiles?.username && <p className={styles.memberHandle}>@{member.profiles.username}</p>}
      </div>
      <div className={styles.memberBadges}>
        {member.role !== 'member' && <span className={`${styles.roleBadge} ${styles[`role_${member.role}`]}`}>{member.role}</span>}
        {member.is_muted && <span className={styles.mutedBadge}>muted</span>}
      </div>
      {hovered && isAdmin && (
        <div className={styles.memberActions}>
          <button className={styles.memberActionBtn} onClick={mute}>{member.is_muted ? 'Unmute' : 'Mute'}</button>
          <button className={`${styles.memberActionBtn} ${styles.kickBtn}`} onClick={kick}>Kick</button>
        </div>
      )}
    </div>
  )
}

export default function CommunityPage() {
  return <ProtectedRoute><CommunityInner /></ProtectedRoute>
}
