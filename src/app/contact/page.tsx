'use client'

import { useState } from 'react'
import styles from '../terms/terms.module.css'
import contactStyles from './contact.module.css'

export default function Contact() {
  const [sent, setSent] = useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <a href="/" className={styles.back}>← mrkt.ee</a>
        <h1 className={styles.title}>Contact</h1>
        <p className={styles.updated}>We typically respond within 24 hours.</p>

        {sent ? (
          <div className={contactStyles.success}>
            <span className={contactStyles.check}>✓</span>
            <p>Message sent. We&apos;ll be in touch soon.</p>
          </div>
        ) : (
          <form
            className={contactStyles.form}
            onSubmit={(e) => { e.preventDefault(); setSent(true) }}
          >
            <div className={contactStyles.field}>
              <label>Name</label>
              <input type="text" placeholder="Alex Johnson" required />
            </div>
            <div className={contactStyles.field}>
              <label>Email</label>
              <input type="email" placeholder="alex@university.edu" required />
            </div>
            <div className={contactStyles.field}>
              <label>Message</label>
              <textarea placeholder="What's on your mind?" rows={5} required />
            </div>
            <button type="submit" className={contactStyles.submit}>Send message →</button>
          </form>
        )}
      </div>
    </div>
  )
}
