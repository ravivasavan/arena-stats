import styles from './ErrorState.module.css'

export default function ErrorState({ message, onLogout }) {
  return (
    <div className={styles.container}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button className={styles.retry} onClick={() => window.location.reload()}>
          Try again
        </button>
        {onLogout && (
          <button className={styles.logout} onClick={onLogout}>
            Use a different token
          </button>
        )}
      </div>
    </div>
  )
}
