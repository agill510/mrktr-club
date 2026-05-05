import Image from 'next/image'
import styles from './ChatWindow.module.css'

interface Message {
  side: 'left' | 'right'
  avatar: string
  name: string
  meta: string
  metaLogo?: string
  text: string
}

const messages: Message[] = [
  {
    side: 'left',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Sarah K.',
    meta: 'Spotify · NYC',
    metaLogo: 'https://cdn.simpleicons.org/spotify',
    text: 'Just referred someone to an open role 👀',
  },
  {
    side: 'right',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'Jordan M.',
    meta: 'NYU · Marketing \'26',
    text: 'Wait, is it still open??',
  },
  {
    side: 'left',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Sarah K.',
    meta: 'Spotify · NYC',
    metaLogo: 'https://cdn.simpleicons.org/spotify',
    text: 'Yes! DM me your resume 🙌',
  },
  {
    side: 'right',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'Jordan M.',
    meta: 'NYU · Marketing \'26',
    text: 'This community is insane 🙏',
  },
]

export default function ChatWindow() {
  return (
    <div className={styles.messages}>
      {messages.map((msg, i) => (
        <div key={i} className={`${styles.msg} ${styles[msg.side]}`}>
          <Image
            className={styles.avatar}
            src={msg.avatar}
            alt={msg.name}
            width={34}
            height={34}
            unoptimized
          />
          <div className={styles.body}>
            <div className={styles.meta}>
              <span className={styles.name}>{msg.name}</span>
              <span className={styles.company}>
                {msg.metaLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={msg.metaLogo} alt="" width={11} height={11} />
                )}
                {msg.meta}
              </span>
            </div>
            <div className={styles.bubble}>{msg.text}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
