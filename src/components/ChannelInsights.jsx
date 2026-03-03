import styles from './ChannelInsights.module.css'

const BLOCK_SIZE_LABELS = {
  '0': '0 blocks',
  '1–10': '1–10',
  '11–50': '11–50',
  '51–100': '51–100',
  '101+': '101+',
}

export default function ChannelInsights({
  channelsByBlockSize,
  idleChannels,
  userSlug,
}) {
  const totalChannels =
    channelsByBlockSize &&
    Object.values(channelsByBlockSize).reduce((a, b) => a + b, 0)
  if (!channelsByBlockSize || !idleChannels || totalChannels === 0) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Channel insights</h2>
        <p className={styles.empty}>No channel data</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Channel insights</h2>

      <section className={styles.section}>
        <h3 className={styles.subheading}>By size</h3>
        <ul className={styles.list}>
          {Object.entries(channelsByBlockSize).map(([key, count]) =>
            count > 0 ? (
              <li key={key} className={styles.item}>
                {BLOCK_SIZE_LABELS[key] || key}: {count} channel
                {count !== 1 ? 's' : ''}
              </li>
            ) : null
          )}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.subheading}>Idle</h3>
        <ul className={styles.list}>
          <li className={styles.item}>
            Not updated in 6 months: {idleChannels.over6Months} channel
            {idleChannels.over6Months !== 1 ? 's' : ''}.
          </li>
          <li className={styles.item}>
            Not updated in 1 year: {idleChannels.over1Year} channel
            {idleChannels.over1Year !== 1 ? 's' : ''}.
          </li>
        </ul>
      </section>
    </div>
  )
}
