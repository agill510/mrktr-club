'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) { setError(err.message); return }
    router.replace('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#07090e',
      fontFamily: 'Helvetica Neue, sans-serif',
    }}>
      <div style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,.1)',
        borderRadius: '24px',
        padding: '44px 36px',
        width: '400px',
      }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
          Set a new password
        </h1>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '14px', marginBottom: '28px' }}>
          Choose a strong password for your mrktr.club account.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: '7px' }}>
              New password
            </label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: '10px', padding: '12px 14px', color: '#fff', fontSize: '14px',
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: '7px' }}>
              Confirm password
            </label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={{
                width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: '10px', padding: '12px 14px', color: '#fff', fontSize: '14px',
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && <p style={{ color: 'rgba(248,113,113,.9)', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            style={{
              width: '100%', marginTop: '8px', padding: '14px', borderRadius: '12px',
              border: 'none', background: '#fff', color: '#0d0f12', fontSize: '15px',
              fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
              opacity: loading || !password || !confirm ? 0.4 : 1,
            }}
          >
            {loading ? 'Updating…' : 'Update password →'}
          </button>
        </form>
      </div>
    </div>
  )
}
