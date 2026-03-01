import styles from './LoadingState.module.css'

export default function LoadingState() {
  return (
    <div className={styles.container}>
      <span className={styles.text}>Loading your Are.na stats</span>
      <span className={styles.dots} />
    </div>
  )
}
