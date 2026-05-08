'use client'

import { useEffect, useState } from 'react'
import styles from './SignupModal.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

type Role = 'student' | 'professional'

export default function SignupModal({ open, onClose }: Props) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<'forward' | 'back'>('forward')
  const [animKey, setAnimKey] = useState(0)
  const [role, setRole] = useState<Role | null>(null)

  const [school, setSchool] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(0); setDir('forward'); setRole(null)
        setSchool(''); setGradYear(''); setCompany(''); setJobTitle('')
        setFirstName(''); setLastName(''); setEmail(''); setPhone('')
      }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

  const go = (next: number, direction: 'forward' | 'back') => {
    setDir(direction)
    setAnimKey(k => k + 1)
    setStep(next)
  }

  const step1Valid = role === 'student'
    ? school.trim() !== ''
    : company.trim() !== '' && jobTitle.trim() !== ''

  const step2Valid = firstName.trim() !== '' && email.trim() !== ''

  return (
    <div
      className={`${styles.backdrop} ${open ? styles.open : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={styles.modalOuter}>
        {/* left arrow */}
        <button
          className={styles.outerArrow}
          style={{ visibility: step >= 1 && step <= 2 ? 'visible' : 'hidden' }}
          onClick={() => go(step - 1, 'back')}
        >←</button>

        <div className={styles.modal}>
          <button className={styles.close} onClick={onClose}>✕</button>

          <div
            key={animKey}
            className={`${styles.step} ${dir === 'forward' ? styles.fromRight : styles.fromLeft}`}
          >

            {/* ── STEP 0: role select ── */}
            {step === 0 && (
              <>
                <p className={styles.title}>Join mrktr.club</p>
                <p className={styles.sub}>I am a...</p>
                <div className={styles.roleGrid}>
                  <button className={styles.roleCard} onClick={() => { setRole('student'); go(1, 'forward') }}>
                    <span className={styles.roleEmoji}>🎓</span>
                    <span className={styles.roleLabel}>Student</span>
                  </button>
                  <button className={styles.roleCard} onClick={() => { setRole('professional'); go(1, 'forward') }}>
                    <span className={styles.roleEmoji}>👔</span>
                    <span className={styles.roleLabel}>Professional</span>
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 1: role-specific info ── */}
            {step === 1 && (
              <>
                <p className={styles.stepTitle}>{role === 'student' ? '🎓 Student' : '👔 Professional'}</p>

                {role === 'student' ? (
                  <>
                    <div className={styles.field}>
                      <label>School</label>
                      <select value={school} onChange={e => setSchool(e.target.value)}>
                        <option value="">Select your school</option>
                        <option value="San Jose State University">San Jose State University</option>
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>Grad Year</label>
                      <input type="number" placeholder="e.g. 2026" value={gradYear} onChange={e => setGradYear(e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.field}>
                      <label>Company</label>
                      <input type="text" placeholder="e.g. Adobe, Google" value={company} onChange={e => setCompany(e.target.value)} />
                    </div>
                    <div className={styles.field}>
                      <label>Job Title</label>
                      <input type="text" placeholder="e.g. Brand Manager" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                    </div>
                  </>
                )}

                <button className={styles.cta} disabled={!step1Valid} onClick={() => step1Valid && go(2, 'forward')}>
                  Continue →
                </button>
              </>
            )}

            {/* ── STEP 2: personal info ── */}
            {step === 2 && (
              <form onSubmit={async (e) => {
              e.preventDefault()
              await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  role,
                  school:     role === 'student' ? school : null,
                  grad_year:  role === 'student' ? gradYear : null,
                  company:    role === 'professional' ? company : null,
                  job_title:  role === 'professional' ? jobTitle : null,
                  first_name: firstName,
                  last_name:  lastName,
                  email,
                  phone,
                }),
              })
              go(3, 'forward')
            }}>
                <p className={styles.stepTitle}>Almost there</p>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>First name</label>
                    <input type="text" placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className={styles.field}>
                    <label>Last name</label>
                    <input type="text" placeholder="Johnson" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input type="email" placeholder={role === 'professional' ? 'alex@company.com' : 'alex@university.edu'} value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>Phone</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                <button type="submit" className={styles.cta}>Submit →</button>
              </form>
            )}

            {/* ── STEP 3: success ── */}
            {step === 3 && (
              <div className={styles.success}>
                <div className={styles.successIcon}>
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3>You&apos;re on the list.</h3>
                <p>We&apos;ll be in touch with access soon.<br />Welcome to mrktr.club.</p>
              </div>
            )}

          </div>
        </div>

        {/* right arrow */}
        <button
          className={styles.outerArrow}
          style={{ visibility: (step === 1 && step1Valid) || (step === 2 && step2Valid) ? 'visible' : 'hidden' }}
          onClick={() => {
            if (step === 1 && step1Valid) go(2, 'forward')
            else if (step === 2 && step2Valid) go(3, 'forward')
          }}
        >→</button>
      </div>
    </div>
  )
}
