'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import styles from './admin.module.css'

const ADMIN_EMAIL = 'ansingh266@gmail.com'

type Tab = 'events' | 'communities' | 'videos'

type Event = { id: string; name: string; date: string; location: string; color: string }
type Community = { id: string; type: string; handle: string; name: string; members: number; active: number; description: string; banner: string }
type Video = { id: string; title: string; speaker: string; date: string; duration: string }

const COLOR_OPTIONS = ['fromTeal', 'fromBlue', 'fromPurple', 'fromAmber']
const BANNER_OPTIONS = ['bannerTeal', 'bannerBlue', 'bannerPurple', 'bannerAmber']
const TYPE_OPTIONS = ['school', 'city', 'company']

const emptyEvent = (): Omit<Event, 'id'> => ({ name: '', date: '', location: '', color: 'fromTeal' })
const emptyCommunity = (): Omit<Community, 'id'> => ({ type: 'school', handle: '', name: '', members: 0, active: 0, description: '', banner: 'bannerTeal' })
const emptyVideo = (): Omit<Video, 'id'> => ({ title: '', speaker: '', date: '', duration: '' })

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('events')

  const [events, setEvents] = useState<Event[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [videos, setVideos] = useState<Video[]>([])

  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null)
  const [editingCommunity, setEditingCommunity] = useState<Partial<Community> | null>(null)
  const [editingVideo, setEditingVideo] = useState<Partial<Video> | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) router.replace('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return
    supabase.from('events').select('*').order('created_at').then(({ data }) => data && setEvents(data))
    supabase.from('communities').select('*').order('created_at').then(({ data }) => data && setCommunities(data))
    supabase.from('videos').select('*').order('created_at').then(({ data }) => data && setVideos(data))
  }, [user])

  if (loading || !user || user.email !== ADMIN_EMAIL) return null

  // ── EVENTS ──
  const saveEvent = async () => {
    if (!editingEvent) return
    setSaving(true); setError('')
    const { id, ...fields } = editingEvent as Event
    const { error: err } = id
      ? await supabase.from('events').update(fields).eq('id', id)
      : await supabase.from('events').insert(fields)
    if (err) { setError(err.message); setSaving(false); return }
    const { data } = await supabase.from('events').select('*').order('created_at')
    if (data) setEvents(data)
    setEditingEvent(null); setSaving(false)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents(e => e.filter(x => x.id !== id))
  }

  // ── COMMUNITIES ──
  const saveCommunity = async () => {
    if (!editingCommunity) return
    setSaving(true); setError('')
    const { id, ...fields } = editingCommunity as Community
    const { error: err } = id
      ? await supabase.from('communities').update(fields).eq('id', id)
      : await supabase.from('communities').insert(fields)
    if (err) { setError(err.message); setSaving(false); return }
    const { data } = await supabase.from('communities').select('*').order('created_at')
    if (data) setCommunities(data)
    setEditingCommunity(null); setSaving(false)
  }

  const deleteCommunity = async (id: string) => {
    if (!confirm('Delete this community?')) return
    await supabase.from('communities').delete().eq('id', id)
    setCommunities(c => c.filter(x => x.id !== id))
  }

  // ── VIDEOS ──
  const saveVideo = async () => {
    if (!editingVideo) return
    setSaving(true); setError('')
    const { id, ...fields } = editingVideo as Video
    const { error: err } = id
      ? await supabase.from('videos').update(fields).eq('id', id)
      : await supabase.from('videos').insert(fields)
    if (err) { setError(err.message); setSaving(false); return }
    const { data } = await supabase.from('videos').select('*').order('created_at')
    if (data) setVideos(data)
    setEditingVideo(null); setSaving(false)
  }

  const deleteVideo = async (id: string) => {
    if (!confirm('Delete this video?')) return
    await supabase.from('videos').delete().eq('id', id)
    setVideos(v => v.filter(x => x.id !== id))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin</h1>
          <p className={styles.sub}>mrktr.club content management</p>
        </div>
        <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>← Dashboard</button>
      </div>

      <div className={styles.tabs}>
        {(['events', 'communities', 'videos'] as Tab[]).map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── EVENTS TAB ── */}
      {tab === 'events' && (
        <div className={styles.section}>
          <button className={styles.addBtn} onClick={() => setEditingEvent(emptyEvent())}>+ Add Event</button>

          {editingEvent && (
            <div className={styles.form}>
              <h3 className={styles.formTitle}>{(editingEvent as Event).id ? 'Edit Event' : 'New Event'}</h3>
              <div className={styles.formGrid}>
                <div className={styles.field}><label>Name</label><input value={editingEvent.name || ''} onChange={e => setEditingEvent(p => ({ ...p, name: e.target.value }))} placeholder="Event name" /></div>
                <div className={styles.field}><label>Date</label><input value={editingEvent.date || ''} onChange={e => setEditingEvent(p => ({ ...p, date: e.target.value }))} placeholder="e.g. June 14, 2026" /></div>
                <div className={styles.field}><label>Location</label><input value={editingEvent.location || ''} onChange={e => setEditingEvent(p => ({ ...p, location: e.target.value }))} placeholder="e.g. San Francisco, CA" /></div>
                <div className={styles.field}><label>Color</label>
                  <select value={editingEvent.color || 'fromTeal'} onChange={e => setEditingEvent(p => ({ ...p, color: e.target.value }))}>
                    {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.formBtns}>
                <button className={styles.saveBtn} onClick={saveEvent} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button className={styles.cancelBtn} onClick={() => setEditingEvent(null)}>Cancel</button>
              </div>
            </div>
          )}

          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Date</th><th>Location</th><th>Color</th><th></th></tr></thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.date}</td>
                  <td>{e.location}</td>
                  <td><span className={styles.badge}>{e.color}</span></td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => setEditingEvent(e)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteEvent(e.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && <tr><td colSpan={5} className={styles.empty}>No events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── COMMUNITIES TAB ── */}
      {tab === 'communities' && (
        <div className={styles.section}>
          <button className={styles.addBtn} onClick={() => setEditingCommunity(emptyCommunity())}>+ Add Community</button>

          {editingCommunity && (
            <div className={styles.form}>
              <h3 className={styles.formTitle}>{(editingCommunity as Community).id ? 'Edit Community' : 'New Community'}</h3>
              <div className={styles.formGrid}>
                <div className={styles.field}><label>Handle</label><input value={editingCommunity.handle || ''} onChange={e => setEditingCommunity(p => ({ ...p, handle: e.target.value }))} placeholder="@sjsu" /></div>
                <div className={styles.field}><label>Name</label><input value={editingCommunity.name || ''} onChange={e => setEditingCommunity(p => ({ ...p, name: e.target.value }))} placeholder="San Jose State University" /></div>
                <div className={styles.field}><label>Type</label>
                  <select value={editingCommunity.type || 'school'} onChange={e => setEditingCommunity(p => ({ ...p, type: e.target.value }))}>
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.field}><label>Banner</label>
                  <select value={editingCommunity.banner || 'bannerTeal'} onChange={e => setEditingCommunity(p => ({ ...p, banner: e.target.value }))}>
                    {BANNER_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className={styles.field}><label>Members</label><input type="number" value={editingCommunity.members || 0} onChange={e => setEditingCommunity(p => ({ ...p, members: +e.target.value }))} /></div>
                <div className={styles.field}><label>Active Today</label><input type="number" value={editingCommunity.active || 0} onChange={e => setEditingCommunity(p => ({ ...p, active: +e.target.value }))} /></div>
                <div className={`${styles.field} ${styles.fullWidth}`}><label>Description</label><input value={editingCommunity.description || ''} onChange={e => setEditingCommunity(p => ({ ...p, description: e.target.value }))} placeholder="Short description" /></div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.formBtns}>
                <button className={styles.saveBtn} onClick={saveCommunity} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button className={styles.cancelBtn} onClick={() => setEditingCommunity(null)}>Cancel</button>
              </div>
            </div>
          )}

          <table className={styles.table}>
            <thead><tr><th>Handle</th><th>Name</th><th>Type</th><th>Members</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {communities.map(c => (
                <tr key={c.id}>
                  <td>{c.handle}</td>
                  <td>{c.name}</td>
                  <td><span className={styles.badge}>{c.type}</span></td>
                  <td>{c.members}</td>
                  <td>{c.active}</td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => setEditingCommunity(c)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteCommunity(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {communities.length === 0 && <tr><td colSpan={6} className={styles.empty}>No communities yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── VIDEOS TAB ── */}
      {tab === 'videos' && (
        <div className={styles.section}>
          <button className={styles.addBtn} onClick={() => setEditingVideo(emptyVideo())}>+ Add Video</button>

          {editingVideo && (
            <div className={styles.form}>
              <h3 className={styles.formTitle}>{(editingVideo as Video).id ? 'Edit Video' : 'New Video'}</h3>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fullWidth}`}><label>Title</label><input value={editingVideo.title || ''} onChange={e => setEditingVideo(p => ({ ...p, title: e.target.value }))} placeholder="Video title" /></div>
                <div className={styles.field}><label>Speaker</label><input value={editingVideo.speaker || ''} onChange={e => setEditingVideo(p => ({ ...p, speaker: e.target.value }))} placeholder="Speaker name" /></div>
                <div className={styles.field}><label>Date</label><input value={editingVideo.date || ''} onChange={e => setEditingVideo(p => ({ ...p, date: e.target.value }))} placeholder="e.g. Jun 14, 2026" /></div>
                <div className={styles.field}><label>Duration</label><input value={editingVideo.duration || ''} onChange={e => setEditingVideo(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 42:18" /></div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.formBtns}>
                <button className={styles.saveBtn} onClick={saveVideo} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button className={styles.cancelBtn} onClick={() => setEditingVideo(null)}>Cancel</button>
              </div>
            </div>
          )}

          <table className={styles.table}>
            <thead><tr><th>Title</th><th>Speaker</th><th>Date</th><th>Duration</th><th></th></tr></thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id}>
                  <td>{v.title}</td>
                  <td>{v.speaker}</td>
                  <td>{v.date}</td>
                  <td>{v.duration}</td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => setEditingVideo(v)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteVideo(v.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && <tr><td colSpan={5} className={styles.empty}>No videos yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
