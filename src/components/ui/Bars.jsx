import { memo } from 'react'
import styles from './Bars.module.css'

/**
 * Horizontal bar list. Each item is { label, count, color?, href?, segments? }.
 * `segments` ([{ key, count, color }]) turns the bar into a stacked bar.
 */
export default memo(function Bars({ items, formatValue, labelWidth = '4.5ch' }) {
  if (!items?.length) return null
  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <div className={styles.chart}>
      {items.map((item) => {
        const pct = (item.count / max) * 100
        return (
          <div key={item.label} className={styles.row}>
            <span className={styles.label} style={{ width: labelWidth }} title={item.label}>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              ) : (
                item.label
              )}
            </span>
            <div className={styles.track}>
              <div className={styles.bar} style={{ width: `${Math.max(pct, item.count ? 1.5 : 0)}%` }}>
                {item.segments
                  ? item.segments
                      .filter((seg) => seg.count > 0)
                      .map((seg) => (
                        <span
                          key={seg.key}
                          className={styles.segment}
                          style={{ flex: seg.count, background: seg.color }}
                          title={`${seg.key}: ${seg.count.toLocaleString()}`}
                        />
                      ))
                  : (
                      <span
                        className={styles.segment}
                        style={{ flex: 1, background: item.color || 'var(--chart-3)' }}
                      />
                    )}
              </div>
            </div>
            <span className={styles.count}>
              {formatValue ? formatValue(item.count) : item.count.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
})
