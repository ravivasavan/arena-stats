import styles from './StatCard.module.css'

export default function StatCard({ value, label }) {
  return (
    <div className={styles.card}>
      <span className={styles.value}>{value.toLocaleString()}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
