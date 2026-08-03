import styles from './LoadProgress.module.css'

const STAGE_LABELS = {
  account: 'Reading your account',
  channels: 'Loading channels',
  blocks: 'Loading blocks',
  social: 'Loading your social graph',
}

export default function LoadProgress({ progress }) {
  if (!progress) return null

  const { stage, page, totalPages, loaded, total } = progress
  const pct = totalPages ? Math.round((page / totalPages) * 100) : null

  const detail =
    stage === 'blocks' && total
      ? `${(loaded ?? 0).toLocaleString()} of ${total.toLocaleString()}`
      : totalPages
        ? `page ${page} of ${totalPages}`
        : null

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.row}>
        <span className={styles.label}>{STAGE_LABELS[stage] ?? 'Loading'}</span>
        {detail && <span className={styles.detail}>{detail}</span>}
      </div>
      <div className={styles.track}>
        <div
          className={pct == null ? styles.indeterminate : styles.bar}
          style={pct == null ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
