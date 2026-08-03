import { memo } from 'react'
import styles from './StackedBar.module.css'

/** Proportional bar plus legend. Segments are { key, label, count, color }. */
export default memo(function StackedBar({ segments, total, formatValue }) {
  const sum = total ?? segments.reduce((acc, seg) => acc + seg.count, 0)
  const visible = segments.filter((seg) => seg.count > 0)
  if (!sum) return null

  return (
    <div>
      <div className={styles.bar}>
        {visible.map((seg) => (
          <div
            key={seg.key}
            className={styles.segment}
            style={{ flex: seg.count, backgroundColor: seg.color }}
            title={`${seg.label}: ${seg.count.toLocaleString()}`}
          />
        ))}
      </div>
      <div className={styles.legend}>
        {segments.map((seg) => (
          <div key={seg.key} className={styles.item}>
            <span className={styles.dot} style={{ backgroundColor: seg.color }} />
            <span className={styles.label}>{seg.label}</span>
            <span className={styles.value}>
              {formatValue ? formatValue(seg.count) : seg.count.toLocaleString()}{' '}
              <span className={styles.pct}>({Math.round((seg.count / sum) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
