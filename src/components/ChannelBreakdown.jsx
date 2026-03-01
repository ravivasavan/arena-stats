import styles from './ChannelBreakdown.module.css'

export default function ChannelBreakdown({ channelsByVisibility, totalChannels }) {
  const segments = [
    { key: 'public', label: 'Public', count: channelsByVisibility.public, color: 'var(--color-public)' },
    { key: 'closed', label: 'Closed', count: channelsByVisibility.closed, color: 'var(--color-closed)' },
    { key: 'private', label: 'Private', count: channelsByVisibility.private, color: 'var(--color-private)' },
  ]

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Channels by Visibility</h2>
      <div className={styles.bar}>
        {segments.map(
          (seg) =>
            seg.count > 0 && (
              <div
                key={seg.key}
                className={styles.segment}
                style={{
                  flex: seg.count,
                  backgroundColor: seg.color,
                }}
              />
            ),
        )}
      </div>
      <div className={styles.legend}>
        {segments.map((seg) => (
          <div key={seg.key} className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ backgroundColor: seg.color }}
            />
            <span className={styles.legendLabel}>{seg.label}</span>
            <span className={styles.legendCount}>
              {seg.count}{' '}
              <span className={styles.legendPct}>
                ({totalChannels > 0 ? Math.round((seg.count / totalChannels) * 100) : 0}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
