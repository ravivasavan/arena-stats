import styles from './ChannelTimeline.module.css'

export default function ChannelTimeline({ channelsByYear }) {
  const years = Object.keys(channelsByYear).sort()
  const max = Math.max(...Object.values(channelsByYear))

  if (years.length === 0) return null

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Channels Created by Year</h2>
      <div className={styles.chart}>
        {years.map((year) => {
          const count = channelsByYear[year]
          const pct = max > 0 ? (count / max) * 100 : 0
          return (
            <div key={year} className={styles.row}>
              <span className={styles.year}>{year}</span>
              <div className={styles.track}>
                <div
                  className={styles.bar}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={styles.count}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
