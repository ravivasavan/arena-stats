import styles from './LoadingState.module.css'

const STAGE_TEXT = {
  account: 'Reading your account',
  channels: 'Loading your channels',
  blocks: 'Loading your blocks',
  social: 'Loading your social graph',
}

export default function LoadingState({ progress }) {
  return (
    <div className={styles.container}>
      <span className={styles.text}>
        {STAGE_TEXT[progress?.stage] ?? 'Loading your Are.na stats'}
      </span>
      <span className={styles.dots} />
    </div>
  )
}
