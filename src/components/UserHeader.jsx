import styles from './UserHeader.module.css'

export default function UserHeader({ user }) {
  return (
    <header className={styles.header}>
      {user.avatar && (
        <img
          className={styles.avatar}
          src={user.avatar}
          alt={user.name}
        />
      )}
      <div>
        <h1 className={styles.name}>{user.name}</h1>
        <a
          className={styles.link}
          href={`https://www.are.na/${user.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          are.na/{user.slug}
        </a>
      </div>
    </header>
  )
}
