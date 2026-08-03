import { memo } from 'react'
import styles from './UserHeader.module.css'

export default memo(function UserHeader({ user }) {
  const tags = [user.badge, user.tier].filter(
    (tag, index, all) => tag && all.indexOf(tag) === index,
  )

  return (
    <header className={styles.header}>
      {user.avatar && <img className={styles.avatar} src={user.avatar} alt={user.name} />}
      <div className={styles.body}>
        <h1 className={styles.name}>
          {user.name}
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </h1>
        <a
          className={styles.link}
          href={`https://www.are.na/${user.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          are.na/{user.slug}
        </a>
        {user.memberSince && (
          <span className={styles.meta}>
            Member since {user.memberSince} &middot; {user.accountAge}
          </span>
        )}
        {user.firstChannel && (
          <span className={styles.meta}>
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
})
