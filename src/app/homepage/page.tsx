'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ImageUploadEditor from '@/components/ImageUploadEditor'
import styles from './admin.module.css'

const ADMIN_PASSWORD = 'mrktr2026admin'

type Tab = 'events' | 'communities' | 'videos'
type Channel = { id: string; name: string; description: string; is_private: boolean; position: number }
type Event = { id: string; name: string; date: string; location: string; color: string; image_url: string; image_position: string; image_zoom: number; description: string; time: string; speaker_name: string; speaker_title: string; speaker_company: string; speaker_bio: string; speaker_image: string; why_attend: string; max_spots: number }
type Community = { id: string; type: string; handle: string; name: string; members: number; active: number; description: string; banner: string; banner_url: string; logo_url: string; banner_position: string; banner_zoom: number }
type Video = { id: string; title: string; speaker: string; date: string; duration: string; thumbnail_url: string; thumbnail_position: string; thumbnail_zoom: number }

const COLOR_OPTIONS = ['fromTeal', 'fromBlue', 'fromPurple', 'fromAmber']
const BANNER_OPTIONS = ['bannerTeal', 'bannerBlue', 'bannerPurple', 'bannerAmber']
const TYPE_OPTIONS = ['school', 'city', 'company']

const GRADIENTS: Record<string, string> = {
  fromTeal:    'linear-gradient(160deg, #0c4d3d 0%, #12af82 100%)',
  fromBlue:    'linear-gradient(160deg, #101e60 0%, #3b82f6 100%)',
  fromPurple:  'linear-gradient(160deg, #4c1d95 0%, #8b5cf6 100%)',
  fromAmber:   'linear-gradient(160deg, #78350f 0%, #f59e0b 100%)',
  bannerTeal:  'linear-gradient(135deg, #0c4d3d 0%, #12af82 100%)',
  bannerBlue:  'linear-gradient(135deg, #101e60 0%, #3b82f6 100%)',
  bannerPurple:'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)',
  bannerAmber: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
}

const emptyEvent = (): Omit<Event, 'id'> => ({ name: '', date: '', location: '', color: 'fromTeal', image_url: '', image_position: '50% 50%', image_zoom: 110, description: '', time: '', speaker_name: '', speaker_title: '', speaker_company: '', speaker_bio: '', speaker_image: '', why_attend: '', max_spots: 0 })
const emptyCommunity = (): Omit<Community, 'id'> => ({ type: 'school', handle: '', name: '', members: 0, active: 0, description: '', banner: 'bannerTeal', banner_url: '', logo_url: '', banner_position: '50% 50%', banner_zoom: 110 })
const emptyVideo = (): Omit<Video, 'id'> => ({ title: '', speaker: '', date: '', duration: '', thumbnail_url: '', thumbnail_position: '50% 50%', thumbnail_zoom: 110 })

export default function AdminPage() {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [tab, setTab] = useState<Tab>('events')
  const [events, setEvents] = useState<Event[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null)
  const [editingCommunity, setEditingCommunity] = useState<Partial<Community> | null>(null)
  const [editingVideo, setEditingVideo] = useState<Partial<Video> | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelPrivate, setNewChannelPrivate] = useState(false)
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('admin_unlocked') === 'true') unlock()
  }, [])

  const unlock = async () => {
    setUnlocked(true)
    setLoading(true)
    const [evts, comms, vids] = await Promise.all([
      supabase.from('events').select('*').order('created_at'),
      supabase.from('communities').select('*').order('created_at'),
      supabase.from('videos').select('*').order('created_at'),
    ])
    if (evts.data) setEvents(evts.data)
    if (comms.data) setCommunities(comms.data)
    if (vids.data) setVideos(vids.data)
    setLoading(false)
  }

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_unlocked', 'true')
      unlock()
    } else {
      setPwError(true)
      setPw('')
    }
  }

  if (!unlocked) return (
    <div style={{ minHeight: '100vh', background: '#07090e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: '-0.5px', marginBottom: 4 }}>Admin Access</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>Enter the admin password to continue.</p>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => { setPw(e.target.value); setPwError(false) }}
          autoFocus
          style={{ background: 'rgba(255,255,255,.06)', border: `1px solid ${pwError ? 'rgba(248,113,113,.5)' : 'rgba(255,255,255,.1)'}`, borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', outline: 'none' }}
        />
        {pwError && <p style={{ color: 'rgba(248,113,113,.9)', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>Incorrect password.</p>}
        <button type="submit" style={{ background: '#fff', border: 'none', borderRadius: 10, padding: '12px', color: '#0d0f12', fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer' }}>
          Enter →
        </button>
      </form>
    </div>
  )

  const saveEvent = async () => {
    if (!editingEvent) return
    setSaving(true); setError('')
    const { id, ...fields } = editingEvent as Event
    const { error: err } = id ? await supabase.from('events').update(fields).eq('id', id) : await supabase.from('events').insert(fields)
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

  const saveCommunity = async () => {
    if (!editingCommunity) return
    setSaving(true); setError('')
    const { id, ...fields } = editingCommunity as Community
    const { error: err } = id ? await supabase.from('communities').update(fields).eq('id', id) : await supabase.from('communities').insert(fields)
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

  const loadChannels = async (communityId: string) => {
    const { data } = await supabase.from('channels').select('*').eq('community_id', communityId).order('position')
    setChannels(data ?? [])
  }

  const addChannel = async (communityId: string) => {
    if (!newChannelName.trim()) return
    await supabase.from('channels').insert({ community_id: communityId, name: newChannelName.trim().toLowerCase().replace(/\s+/g, '-'), is_private: newChannelPrivate, position: channels.length })
    setNewChannelName(''); setNewChannelPrivate(false)
    loadChannels(communityId)
  }

  const updateChannel = async (communityId: string) => {
    if (!editingChannel) return
    await supabase.from('channels').update({ name: editingChannel.name, description: editingChannel.description, is_private: editingChannel.is_private }).eq('id', editingChannel.id)
    setEditingChannel(null); loadChannels(communityId)
  }

  const deleteChannel = async (channelId: string, communityId: string) => {
    if (!confirm('Delete this channel? All messages will be lost.')) return
    await supabase.from('channels').delete().eq('id', channelId)
    loadChannels(communityId)
  }

  const saveVideo = async () => {
    if (!editingVideo) return
    setSaving(true); setError('')
    const { id, ...fields } = editingVideo as Video
    const { error: err } = id ? await supabase.from('videos').update(fields).eq('id', id) : await supabase.from('videos').insert(fields)
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
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={styles.backBtn} onClick={() => router.push('/home')}>← Dashboard</button>
          <button className={styles.backBtn} onClick={() => { sessionStorage.removeItem('admin_unlocked'); setUnlocked(false) }}>Lock</button>
        </div>
      </div>

      <div className={styles.tabs}>
        {(['events', 'communities', 'videos'] as Tab[]).map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)} disabled={loading}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.skeletonWrap}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} style={{ animationDelay: `${i * 0.07}s` }}>
              <div className={styles.skeletonCell} style={{ width: 52 }} />
              <div className={styles.skeletonCell} style={{ width: '28%' }} />
              <div className={styles.skeletonCell} style={{ width: '16%' }} />
              <div className={styles.skeletonCell} style={{ width: '20%' }} />
              <div className={styles.skeletonCell} style={{ width: '10%' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'events' && (
        <div className={styles.section}>
          <button className={styles.addBtn} onClick={() => setEditingEvent(emptyEvent())}>+ Add Event</button>
          {editingEvent && (
            <div className={styles.form}>
              <h3 className={styles.formTitle}>{(editingEvent as Event).id ? 'Edit Event' : 'New Event'}</h3>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Event Slide</label>
                  <ImageUploadEditor
                    imageUrl={editingEvent.image_url || ''}
                    imagePosition={editingEvent.image_position || '50% 50%'}
                    imageZoom={editingEvent.image_zoom ?? 110}
                    storagePath="events"
                    cardBackground={GRADIENTS[editingEvent.color || 'fromTeal']}
                    aspectRatio="5/3"
                    onChange={patch => setEditingEvent(p => ({
                      ...p,
                      ...(patch.imageUrl      !== undefined && { image_url:      patch.imageUrl }),
                      ...(patch.imagePosition !== undefined && { image_position: patch.imagePosition }),
                      ...(patch.imageZoom     !== undefined && { image_zoom:     patch.imageZoom }),
                    }))}
                    overlay={
                      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.8) 0%, rgba(0,0,0,.1) 50%, transparent 100%)' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 22px 20px' }}>
                          <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.6px' }}>{editingEvent.name || 'Event Name'}</p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 14 }}>{editingEvent.date || 'Date'}{editingEvent.location ? ` · ${editingEvent.location}` : ''}</p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,.3)', color: '#fff' }}>Learn more</div>
                            <div style={{ fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8, background: '#fff', color: '#0d0f12' }}>Register →</div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
                <div className={styles.field}><label>Name</label><input value={editingEvent.name || ''} onChange={e => setEditingEvent(p => ({ ...p, name: e.target.value }))} placeholder="Event name" /></div>
                <div className={styles.field}><label>Date</label><input value={editingEvent.date || ''} onChange={e => setEditingEvent(p => ({ ...p, date: e.target.value }))} placeholder="e.g. June 14, 2026" /></div>
                <div className={styles.field}><label>Time</label><input value={editingEvent.time || ''} onChange={e => setEditingEvent(p => ({ ...p, time: e.target.value }))} placeholder="e.g. 6:00 PM – 8:00 PM PST" /></div>
                <div className={styles.field}><label>Location</label><input value={editingEvent.location || ''} onChange={e => setEditingEvent(p => ({ ...p, location: e.target.value }))} placeholder="e.g. San Francisco, CA" /></div>
                <div className={styles.field}><label>Color</label>
                  <select value={editingEvent.color || 'fromTeal'} onChange={e => setEditingEvent(p => ({ ...p, color: e.target.value }))}>
                    {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.field}><label>Max Spots</label><input type="number" value={editingEvent.max_spots || 0} onChange={e => setEditingEvent(p => ({ ...p, max_spots: +e.target.value }))} placeholder="0 = unlimited" /></div>
                <div className={`${styles.field} ${styles.fullWidth}`}><label>Description</label><textarea rows={4} value={editingEvent.description || ''} onChange={e => setEditingEvent(p => ({ ...p, description: e.target.value }))} placeholder="About this event…" className={styles.textarea} /></div>
                <div className={`${styles.field} ${styles.fullWidth}`}><label>Why Attend (one reason per line)</label><textarea rows={3} value={editingEvent.why_attend || ''} onChange={e => setEditingEvent(p => ({ ...p, why_attend: e.target.value }))} placeholder="Network with 100+ marketers&#10;Hear from industry leaders&#10;Free food and drinks" className={styles.textarea} /></div>
                <div className={styles.field}>
                  <label>Speaker Photo</label>
                  <ImageUploadEditor
                    imageUrl={editingEvent.speaker_image || ''}
                    imagePosition="50% 50%"
                    imageZoom={100}
                    storagePath="speakers"
                    cardBackground="rgba(255,255,255,.08)"
                    aspectRatio="1/1"
                    fixedWidth={100}
                    onChange={patch => setEditingEvent(p => ({ ...p, speaker_image: patch.imageUrl ?? p?.speaker_image ?? '' }))}
                  />
                </div>
                <div className={styles.field}><label>Speaker Name</label><input value={editingEvent.speaker_name || ''} onChange={e => setEditingEvent(p => ({ ...p, speaker_name: e.target.value }))} placeholder="Jane Smith" /></div>
                <div className={styles.field}><label>Speaker Title</label><input value={editingEvent.speaker_title || ''} onChange={e => setEditingEvent(p => ({ ...p, speaker_title: e.target.value }))} placeholder="VP of Marketing" /></div>
                <div className={styles.field}><label>Speaker Company</label><input value={editingEvent.speaker_company || ''} onChange={e => setEditingEvent(p => ({ ...p, speaker_company: e.target.value }))} placeholder="Acme Corp" /></div>
                <div className={`${styles.field} ${styles.fullWidth}`}><label>Speaker Bio</label><textarea rows={3} value={editingEvent.speaker_bio || ''} onChange={e => setEditingEvent(p => ({ ...p, speaker_bio: e.target.value }))} placeholder="Short bio…" className={styles.textarea} /></div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.formBtns}>
                <button className={styles.saveBtn} onClick={saveEvent} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button className={styles.cancelBtn} onClick={() => setEditingEvent(null)}>Cancel</button>
              </div>
            </div>
          )}
          <table className={styles.table}>
            <thead><tr><th>Image</th><th>Name</th><th>Date</th><th>Location</th><th>Color</th><th></th></tr></thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td>{e.image_url ? <div className={styles.thumbCell} style={{ backgroundImage: `url(${e.image_url})` }} /> : <span className={styles.noImg}>—</span>}</td>
                  <td>{e.name}</td><td>{e.date}</td><td>{e.location}</td>
                  <td><span className={styles.badge}>{e.color}</span></td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => setEditingEvent(e)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteEvent(e.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && <tr><td colSpan={6} className={styles.empty}>No events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'communities' && (
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
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Banner Image</label>
                  <ImageUploadEditor
                    imageUrl={editingCommunity.banner_url || ''}
                    imagePosition={editingCommunity.banner_position || '50% 50%'}
                    imageZoom={editingCommunity.banner_zoom ?? 110}
                    storagePath="communities/banners"
                    cardBackground={GRADIENTS[editingCommunity.banner || 'bannerTeal']}
                    aspectRatio="16/4"
                    onChange={patch => setEditingCommunity(p => ({
                      ...p,
                      ...(patch.imageUrl      !== undefined && { banner_url:      patch.imageUrl }),
                      ...(patch.imagePosition !== undefined && { banner_position: patch.imagePosition }),
                      ...(patch.imageZoom     !== undefined && { banner_zoom:     patch.imageZoom }),
                    }))}
                    overlay={
                      <div style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'none', background: '#4a90e8', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                        ✓ Verified
                      </div>
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label>Profile Picture</label>
                  <ImageUploadEditor
                    imageUrl={editingCommunity.logo_url || ''}
                    imagePosition="50% 50%"
                    imageZoom={100}
                    storagePath="communities/logos"
                    cardBackground="rgba(255,255,255,.08)"
                    aspectRatio="1/1"
                    fixedWidth={100}
                    onChange={patch => setEditingCommunity(p => ({ ...p, logo_url: patch.imageUrl ?? p?.logo_url ?? '' }))}
                  />
                </div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              {/* ── Channel management ── */}
              {(editingCommunity as Community).id && (
                <div className={styles.channelSection}>
                  <p className={styles.channelSectionTitle}>Channels</p>
                  {channels.map(ch => (
                    <div key={ch.id} className={styles.channelRow}>
                      {editingChannel?.id === ch.id ? (
                        <>
                          <input className={styles.channelInput} value={editingChannel.name} onChange={e => setEditingChannel({ ...editingChannel, name: e.target.value })} />
                          <input className={styles.channelInput} style={{ flex: 2 }} value={editingChannel.description ?? ''} onChange={e => setEditingChannel({ ...editingChannel, description: e.target.value })} placeholder="Description (optional)" />
                          <label className={styles.channelPrivateLabel}>
                            <input type="checkbox" checked={editingChannel.is_private} onChange={e => setEditingChannel({ ...editingChannel, is_private: e.target.checked })} /> Private
                          </label>
                          <button className={styles.editBtn} onClick={() => updateChannel((editingCommunity as Community).id)}>Save</button>
                          <button className={styles.cancelBtn} style={{ padding: '5px 10px' }} onClick={() => setEditingChannel(null)}>✕</button>
                        </>
                      ) : (
                        <>
                          <span className={styles.channelChip}>#{ch.name}{ch.is_private ? ' 🔒' : ''}</span>
                          <button className={styles.editBtn} onClick={() => setEditingChannel(ch)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => deleteChannel(ch.id, (editingCommunity as Community).id)}>Delete</button>
                        </>
                      )}
                    </div>
                  ))}
                  <div className={styles.channelRow} style={{ marginTop: 8 }}>
                    <input className={styles.channelInput} value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="new-channel-name" onKeyDown={e => e.key === 'Enter' && addChannel((editingCommunity as Community).id)} />
                    <label className={styles.channelPrivateLabel}>
                      <input type="checkbox" checked={newChannelPrivate} onChange={e => setNewChannelPrivate(e.target.checked)} /> Private
                    </label>
                    <button className={styles.editBtn} onClick={() => addChannel((editingCommunity as Community).id)}>+ Add</button>
                  </div>
                </div>
              )}

              <div className={styles.formBtns}>
                <button className={styles.saveBtn} onClick={saveCommunity} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button className={styles.cancelBtn} onClick={() => { setEditingCommunity(null); setChannels([]) }}>Cancel</button>
              </div>
            </div>
          )}
          <table className={styles.table}>
            <thead><tr><th>Logo</th><th>Banner</th><th>Handle</th><th>Name</th><th>Type</th><th>Members</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {communities.map(c => (
                <tr key={c.id}>
                  <td>{c.logo_url ? <img src={c.logo_url} alt="logo" className={styles.thumbLogo} /> : <span className={styles.noImg}>—</span>}</td>
                  <td>{c.banner_url ? <div className={styles.thumbCell} style={{ backgroundImage: `url(${c.banner_url})` }} /> : <span className={styles.noImg}>—</span>}</td>
                  <td>{c.handle}</td><td>{c.name}</td>
                  <td><span className={styles.badge}>{c.type}</span></td>
                  <td>{c.members}</td><td>{c.active}</td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => { setEditingCommunity(c); loadChannels(c.id) }}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteCommunity(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {communities.length === 0 && <tr><td colSpan={8} className={styles.empty}>No communities yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'videos' && (
        <div className={styles.section}>
          <button className={styles.addBtn} onClick={() => setEditingVideo(emptyVideo())}>+ Add Video</button>
          {editingVideo && (
            <div className={styles.form}>
              <h3 className={styles.formTitle}>{(editingVideo as Video).id ? 'Edit Video' : 'New Video'}</h3>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Thumbnail</label>
                  <ImageUploadEditor
                    imageUrl={editingVideo.thumbnail_url || ''}
                    imagePosition={editingVideo.thumbnail_position || '50% 50%'}
                    imageZoom={editingVideo.thumbnail_zoom ?? 110}
                    storagePath="videos"
                    cardBackground="rgba(255,255,255,.06)"
                    aspectRatio="16/9"
                    onChange={patch => setEditingVideo(p => ({
                      ...p,
                      ...(patch.imageUrl      !== undefined && { thumbnail_url:      patch.imageUrl }),
                      ...(patch.imagePosition !== undefined && { thumbnail_position: patch.imagePosition }),
                      ...(patch.imageZoom     !== undefined && { thumbnail_zoom:     patch.imageZoom }),
                    }))}
                    overlay={
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff' }}>▶</div>
                        {editingVideo.duration && <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.7)', background: 'rgba(0,0,0,.5)', padding: '2px 7px', borderRadius: 4 }}>{editingVideo.duration}</span>}
                      </div>
                    }
                  />
                </div>
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
            <thead><tr><th>Thumbnail</th><th>Title</th><th>Speaker</th><th>Date</th><th>Duration</th><th></th></tr></thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id}>
                  <td>{v.thumbnail_url ? <div className={styles.thumbWide} style={{ backgroundImage: `url(${v.thumbnail_url})` }} /> : <span className={styles.noImg}>—</span>}</td>
                  <td>{v.title}</td><td>{v.speaker}</td><td>{v.date}</td><td>{v.duration}</td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => setEditingVideo(v)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteVideo(v.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && <tr><td colSpan={6} className={styles.empty}>No videos yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
