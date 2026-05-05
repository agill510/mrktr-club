import styles from './LogosStrip.module.css'

const logos = [
  { src: 'https://cdn.simpleicons.org/meta',    alt: 'Meta' },
  { src: 'https://cdn.simpleicons.org/google',  alt: 'Google' },
  { src: 'https://cdn.simpleicons.org/apple',   alt: 'Apple' },
  { src: 'https://cdn.simpleicons.org/tesla',   alt: 'Tesla' },
  { src: 'https://cdn.simpleicons.org/nvidia',  alt: 'Nvidia' },
  { src: 'https://cdn.simpleicons.org/spotify', alt: 'Spotify' },
  { src: 'https://cdn.simpleicons.org/netflix', alt: 'Netflix' },
  { src: '/amazon.png',                          alt: 'Amazon', size: 52 },
  { src: '/adobe.png',                           alt: 'Adobe',  size: 34 },
]

export default function LogosStrip() {
  return (
    <div className={`${styles.section} anim-logos`}>
      <p className={styles.label}>members from</p>
      <div className={styles.row}>
        {logos.map((logo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={logo.alt}
            className={styles.logo}
            src={logo.src}
            alt={logo.alt}
            style={logo.size ? { height: `${logo.size}px` } : undefined}
          />
        ))}
      </div>
    </div>
  )
}
