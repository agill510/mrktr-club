import styles from './terms.module.css'

export const metadata = { title: 'Terms of Service — mrktr.club' }

export default function Terms() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <a href="/" className={styles.back}>← mrktr.club</a>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.updated}>Last updated: May 2026</p>

        <section className={styles.section}>
          <h2>1. Acceptance</h2>
          <p>By accessing or using mrktr.club, you agree to be bound by these Terms. If you do not agree, do not use the platform.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Eligibility</h2>
          <p>You must be at least 16 years old and a current or former marketing student, alumni, or working professional to join mrktr.club.</p>
        </section>

        <section className={styles.section}>
          <h2>3. Community Standards</h2>
          <p>mrktr.club is a private community. Members are expected to act professionally and respectfully. We reserve the right to remove any member who violates community standards, engages in spam, harassment, or misrepresentation.</p>
        </section>

        <section className={styles.section}>
          <h2>4. Content</h2>
          <p>You retain ownership of any content you post. By posting, you grant mrktr.club a non-exclusive license to display that content within the platform. You are solely responsible for your content.</p>
        </section>

        <section className={styles.section}>
          <h2>5. Referrals & Job Postings</h2>
          <p>mrktr.club facilitates connections between members but does not guarantee employment or referrals. Any hiring decisions are solely between the member and the employer.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any conduct we deem harmful to the community.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Changes</h2>
          <p>We may update these Terms from time to time. Continued use of mrktr.club after changes constitutes acceptance of the updated Terms.</p>
        </section>

        <section className={styles.section}>
          <h2>8. Contact</h2>
          <p>Questions about these Terms? Reach us at <a href="/contact">our contact page</a>.</p>
        </section>
      </div>
    </div>
  )
}
