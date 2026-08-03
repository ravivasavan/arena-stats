import { memo } from 'react'
import styles from './StatCard.module.css'

export default memo(function StatCard({ value, label, hint }) {
  return (
    <div className={styles.card}>
      <span className={styles.value}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span className={styles.label}>{label}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
})
