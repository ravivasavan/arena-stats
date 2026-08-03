import styles from './Section.module.css'

export default function Section({ title, note, actions, children }) {
  return (
    <section className={styles.section}>
      {(title || actions) && (
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          {note && <span className={styles.note}>{note}</span>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Subheading({ children }) {
  return <h3 className={styles.subheading}>{children}</h3>
}

export function Facts({ children }) {
  return <dl className={styles.facts}>{children}</dl>
}

export function Fact({ label, value, hint }) {
  return (
    <div className={styles.fact}>
      <dt className={styles.factLabel}>{label}</dt>
      <dd className={styles.factValue}>
        {value}
        {hint && <span className={styles.factHint}>{hint}</span>}
      </dd>
    </div>
  )
}

export function Empty({ children = 'Not enough data yet' }) {
  return <p className={styles.empty}>{children}</p>
}
