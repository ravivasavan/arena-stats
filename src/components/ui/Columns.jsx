import { memo } from 'react'
import styles from './Columns.module.css'

/**
 * Vertical bar chart. Items are { key, count, tick?, title? }.
 * `tick` renders a label under that column; leave it off for dense series.
 */
export default memo(function Columns({ items, height = 96, color = 'var(--chart-1)' }) {
  if (!items?.length) return null
  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <div className={styles.wrapper}>
      <div className={styles.plot} style={{ height }}>
        {items.map((item) => (
          <div key={item.key} className={styles.slot} title={item.title}>
            <div
              className={styles.column}
              style={{
                height: `${item.count ? Math.max((item.count / max) * 100, 2) : 0}%`,
                background: color,
              }}
            />
          </div>
        ))}
      </div>
      <div className={styles.ticks}>
        {items.map((item) => (
          <div key={item.key} className={styles.tick}>
            {item.tick ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
})
