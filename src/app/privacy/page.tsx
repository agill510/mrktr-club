import styles from '../terms/terms.module.css'

export const metadata = { title: 'Privacy Policy — mrktr.club' }

export default function Privacy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <a href="/" className={styles.back}>← mrktr.club</a>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: May 2026</p>

        <section className={styles.section}>
          <h2>1. What We Collect</h2>
          <p>When you sign up, we collect your name, email, phone number, and role-specific information (school/grad year or company/job title). We do not sell this information to anyone.</p>
        </section>

        <section className={styles.section}>
          <h2>2. How We Use It</h2>
          <p>We use your information to manage your access to mrktr.club, send you community updates and event invites, and improve the platform experience. We will never send you spam.</p>
        </section>

        <section className={styles.section}>
          <h2>3. Data Storage</h2>
          <p>Your data is stored securely using Supabase, a trusted database provider. We use industry-standard encryption in transit and at rest.</p>
        </section>

        <section className={styles.section}>
          <h2>4. Third Parties</h2>
          <p>We do not sell, rent, or share your personal data with third parties for marketing purposes. We may use trusted service providers (email delivery, analytics) who process data only on our behalf.</p>
        </section>

        <section className={styles.section}>
          <h2>5. Your Rights</h2>
          <p>You can request deletion of your data at any time by contacting us. We will remove your information within 30 days of a verified request.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Cookies</h2>
          <p>mrktr.club uses minimal cookies necessary for the platform to function. We do not use tracking or advertising cookies.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Contact</h2>
          <p>Privacy questions? Reach us at <a href="/contact">our contact page</a>.</p>
        </section>
      </div>
    </div>
  )
}
