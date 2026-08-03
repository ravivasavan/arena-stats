import { memo } from 'react'
import Section, { Empty } from './ui/Section'
import { formatRelative } from '../utils/format'
import styles from './ActivityFeed.module.css'

const PHRASES = {
  followed_user: 'followed',
  followed_channel: 'followed',
  followed_group: 'followed',
  added_block_to_channel: 'added',
  added_channel_to_channel: 'connected',
  created_channel: 'created',
  collaborating_with_user_on_channel: 'is collaborating on',
  collaborating_with_group_on_channel: 'is collaborating on',
  commented_on_block: 'commented on',
  mentioned_you: 'mentioned you in',
  added_user_to_group: 'was added to',
}

function hrefFor(subject) {
  if (!subject) return null
  if (subject.type === 'Channel') {
    return subject.slug && subject.owner
      ? `https://www.are.na/${subject.owner}/${subject.slug}`
      : null
  }
  if ((subject.type === 'User' || subject.type === 'Group') && subject.slug) {
    return `https://www.are.na/${subject.slug}`
  }
  if (subject.id) return `https://www.are.na/block/${subject.id}`
  return null
}

function SubjectLink({ subject, fallback }) {
  if (!subject) return <span>{fallback}</span>
  const label = subject.title || `an untitled ${(subject.type || 'item').toLowerCase()}`
  const href = hrefFor(subject)
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  ) : (
    <span>{label}</span>
  )
}

export default memo(function ActivityFeed({ feed }) {
  if (!feed?.length) {
    return (
      <Section title="From Your Network">
        <Empty>No recent activity</Empty>
      </Section>
    )
  }

  return (
    <Section title="From Your Network" note={`Latest ${feed.length} events`}>
      <ul className={styles.list}>
        {feed.map((activity) => (
          <li key={activity.id} className={styles.item}>
            {activity.actor?.avatar ? (
              <img className={styles.avatar} src={activity.actor.avatar} alt="" loading="lazy" />
            ) : (
              <span className={styles.initials}>
                {activity.actor?.initials ?? activity.actor?.name?.[0] ?? '·'}
              </span>
            )}
            <span className={styles.text}>
              {activity.actor && (
                <a
                  className={styles.actor}
                  href={`https://www.are.na/${activity.actor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activity.actor.name}
                </a>
              )}{' '}
              {PHRASES[activity.kind] ?? activity.kind.replace(/_/g, ' ')}{' '}
              <SubjectLink subject={activity.item} fallback="something" />
              {activity.target && (
                <>
                  {' → '}
                  <SubjectLink subject={activity.target} />
                </>
              )}
            </span>
            <span className={styles.when}>{formatRelative(activity.createdAt)}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
})
