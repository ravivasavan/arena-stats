import styles from './TopChannels.module.css'

export default function TopChannels({ channels, userSlug, title = 'Largest Channels' }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <ol className={styles.list}>
        {channels.map((ch) => (
          <li key={ch.id} className={styles.item}>
            <a
              className={styles.name}
              href={`https://www.are.na/${userSlug}/${ch.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ch.title}
            </a>
            <span className={styles.count}>
              {(ch.counts?.contents || 0).toLocaleString()} blocks
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
