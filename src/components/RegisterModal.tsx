'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './RegisterModal.module.css'

interface Props {
  event: { id: string | number; name: string; date: string; location?: string }
  onClose: () => void
}

export default function RegisterModal({ event, onClose }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('registrations').insert({
      event_id:   String(event.id),
      event_name: event.name,
      first_name: firstName,
      last_name:  lastName,
      email,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✕</button>

        {done ? (
          <div className={styles.success}>
            <div className={styles.checkWrap}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className={styles.successTitle}>You're registered!</h2>
            <p className={styles.successSub}>A confirmation will be sent to <strong>{email}</strong> before the event.</p>
            <button className={styles.cta} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <p className={styles.eventLabel}>Registering for</p>
            <h2 className={styles.title}>{event.name}</h2>
            <p className={styles.meta}>{event.date}{event.location ? ` · ${event.location}` : ''}</p>

            <form className={styles.form} onSubmit={submit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" required />
                </div>
                <div className={styles.field}>
                  <label>Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" required />
                </div>
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" required />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.cta} disabled={loading}>
                {loading ? 'Registering…' : 'Register →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
