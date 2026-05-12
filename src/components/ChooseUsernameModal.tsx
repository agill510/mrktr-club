'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './ChooseUsernameModal.module.css'

interface Props {
  userId: string
  onDone: (username: string) => void
}

export default function ChooseUsernameModal({ userId, onDone }: Props) {
  const [value,     setValue]     = useState('')
  const [status,    setStatus]    = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [saving,    setSaving]    = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const validate = (v: string) => /^[a-z0-9_]{3,20}$/.test(v)

  useEffect(() => {
    const v = value.trim().toLowerCase()
    if (!v) { setStatus('idle'); return }
    if (!validate(v)) { setStatus('invalid'); return }

    setStatus('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', v)
        .neq('id', userId)
        .maybeSingle()
      setStatus(data ? 'taken' : 'available')
    }, 400)
  }, [value, userId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status !== 'available') return
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: userId,
      username: value.trim(),
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    onDone(value.trim())
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Choose your username</h2>
        <p className={styles.sub}>This is your @handle on mrktr.club. You can always change it later in your profile.</p>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.inputWrap}>
            <span className={styles.at}>@</span>
            <input
              className={styles.input}
              value={value}
              onChange={handleChange}
              placeholder="yourhandle"
              autoFocus
              maxLength={20}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <p className={`${styles.hint} ${
            status === 'available' ? styles.hintGreen  :
            status === 'taken'     ? styles.hintRed    :
            status === 'invalid'   ? styles.hintRed    : ''
          }`}>
            {status === 'idle'      && 'Letters, numbers and underscores · 3–20 characters'}
            {status === 'checking'  && 'Checking…'}
            {status === 'available' && '✓ Available'}
            {status === 'taken'     && '✗ Already taken'}
            {status === 'invalid'   && '✗ Letters, numbers and underscores only · 3–20 chars'}
          </p>

          <button
            type="submit"
            className={styles.cta}
            disabled={status !== 'available' || saving}
          >
            {saving ? 'Saving…' : 'Confirm username →'}
          </button>
        </form>
      </div>
    </div>
  )
}
