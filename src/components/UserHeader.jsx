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
        {user.memberSince && (
          <span className={styles.memberSince}>
            Member since {user.memberSince} &middot; {user.accountAge}
          </span>
        )}
        {user.firstChannel && (
          <span className={styles.memberSince}>
            First channel:{' '}
            <a
              className={styles.link}
              href={`https://www.are.na/${user.slug}/${user.firstChannel.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {user.firstChannel.title}
            </a>{' '}
            ({user.firstChannel.formattedDate})
          </span>
        )}
      </div>
    </header>
  )
}
