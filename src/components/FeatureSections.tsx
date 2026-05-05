import styles from './FeatureSections.module.css'

function ConnectMockup() {
  const groups = [
    { icon: '🎓', name: 'SJSU',      count: '312', preview: 'Anyone have Adobe internship tips?' },
    { icon: '🎓', name: 'UCLA',      count: '847', preview: 'Networking event this Friday! 🎉' },
    { icon: '🎓', name: 'Cal',       count: '634', preview: 'Just landed a Google offer 🙌' },
    { icon: '🏢', name: 'Adobe',     count: '289', preview: 'Open roles on the Creative Cloud team 👀' },
    { icon: '📍', name: 'Palo Alto', count: '445', preview: 'Coffee meetup this Saturday?' },
    { icon: '📍', name: 'Fremont',   count: '178', preview: 'Who\'s at the job fair tomorrow?' },
  ]

  return (
    <div className={styles.groupGrid}>
      {groups.map((g) => (
        <div key={g.name} className={styles.groupCard}>
          <div className={styles.groupCardIcon}>{g.icon}</div>
          <div className={styles.groupCardName}>{g.name}</div>
          <div className={styles.groupCardPreview}>{g.preview}</div>
          <div className={styles.groupCardCount}>{g.count} members</div>
        </div>
      ))}
    </div>
  )
}

function ShareMockup() {
  const jobs = [
    { logo: 'https://cdn.simpleicons.org/google', company: 'Google', role: 'Brand Manager', location: 'NYC · Full-time', salary: '$95k–$120k', members: 4 },
    { logo: 'https://cdn.simpleicons.org/spotify', company: 'Spotify', role: 'Sr. Content Strategist', location: 'Remote · Full-time', salary: '$80k–$105k', members: 12 },
    { logo: 'https://cdn.simpleicons.org/meta', company: 'Meta', role: 'Product Marketing Mgr', location: 'NYC · Full-time', salary: '$110k–$140k', members: 7 },
  ]

  return (
    <div className={styles.mockup}>
      <div className={styles.mockupHeader}>
        <span className={styles.mockupTitle}>Job Board</span>
        <span className={styles.mockupCount}>142 open roles</span>
      </div>
      <div className={styles.jobList}>
        {jobs.map((j) => (
          <div key={j.role} className={styles.jobRow}>
            <div className={styles.jobLeft}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={j.logo} alt={j.company} className={styles.jobLogo} />
              <div>
                <div className={styles.jobRole}>{j.role}</div>
                <div className={styles.jobMeta}>{j.company} · {j.location}</div>
                <div className={styles.jobMembers}>👥 {j.members} mrkt.ee members here</div>
              </div>
            </div>
            <div className={styles.jobActions}>
              <button className={styles.btnApply}>Apply</button>
              <button className={styles.btnReferral}>Referral</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LearnMockup() {
  const events = [
    {
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      name: 'Maya R.',
      role: 'CMO @ Glossier',
      topic: 'Building a Brand People Actually Love',
      date: 'Tue May 13 · 6PM EST',
      type: 'Virtual Keynote',
      typeColor: '#1828A0',
    },
    {
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      name: 'Chris L.',
      role: 'Head of Growth @ Linear',
      topic: 'Growth Without the Noise',
      date: 'Fri May 16 · 7PM',
      type: 'NYC Mixer',
      typeColor: '#0e7a63',
    },
    {
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      name: 'Priya S.',
      role: 'VP Marketing @ Figma',
      topic: 'Product Marketing Deep Dive',
      date: 'Wed May 21 · 5PM EST',
      type: 'Workshop',
      typeColor: '#7c3aed',
    },
  ]

  return (
    <div className={styles.mockup}>
      <div className={styles.mockupHeader}>
        <span className={styles.mockupTitle}>Upcoming Events</span>
        <span className={styles.mockupCount}>8 this month</span>
      </div>
      <div className={styles.eventList}>
        {events.map((e) => (
          <div key={e.topic} className={styles.eventRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.avatar} alt={e.name} className={styles.eventAvatar} />
            <div className={styles.eventInfo}>
              <div className={styles.eventTopic}>{e.topic}</div>
              <div className={styles.eventSpeaker}>{e.name} · {e.role}</div>
              <div className={styles.eventDate}>{e.date}</div>
            </div>
            <div>
              <span className={styles.eventType} style={{ background: `${e.typeColor}33`, color: e.typeColor === '#1828A0' ? 'rgba(160,180,255,.9)' : e.typeColor === '#0e7a63' ? 'rgba(100,220,180,.9)' : 'rgba(200,170,255,.9)' }}>
                {e.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FeatureSections() {
  return (
    <div className={styles.wrapper}>

      <div className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.text}>
            <span className={styles.eyebrow}>Connect</span>
            <h2 className={styles.title}>Find your people,<br />wherever they are.</h2>
            <p className={styles.desc}>Jump into group chats organized by city, company, and school. Whether you're a student at Michigan or a brand manager in NYC, there's a room for you.</p>
          </div>
          <ConnectMockup />
        </div>
      </div>

      <div className={styles.section}>
        <div className={`${styles.inner} ${styles.reversed}`}>
          <ShareMockup />
          <div className={styles.text}>
            <span className={styles.eyebrow}>Share</span>
            <h2 className={styles.title}>Jobs and referrals,<br />from people you know.</h2>
            <p className={styles.desc}>Browse roles posted directly by members and request referrals from people already inside the companies you want to work at.</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.text}>
            <span className={styles.eyebrow}>Learn</span>
            <h2 className={styles.title}>World-class speakers,<br />just for this community.</h2>
            <p className={styles.desc}>Attend virtual keynotes, workshops, and in-person mixers led by marketing leaders from the world's best companies. Real knowledge, real people.</p>
          </div>
          <LearnMockup />
        </div>
      </div>

    </div>
  )
}
