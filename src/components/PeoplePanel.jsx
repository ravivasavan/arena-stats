import { memo } from 'react'
import Section, { Empty, Fact, Facts, Subheading } from './ui/Section'
import styles from './PeoplePanel.module.css'

function Avatar({ person }) {
  return person.avatar ? (
    <img className={styles.avatar} src={person.avatar} alt="" loading="lazy" />
  ) : (
    <span className={styles.initials}>{person.initials ?? person.name?.[0] ?? '?'}</span>
  )
}

export default memo(function PeoplePanel({ user, channels, social }) {
  const following = social?.following
  const groups = social?.groups ?? []
  const followers = social?.followers
  const collaborators = channels?.topCollaborators ?? []

  const ratio = user.counts.following
    ? (user.counts.followers / user.counts.following).toFixed(2)
    : '—'

  return (
    <Section
      title="People & Groups"
      note={
        channels?.distinctCollaborators
          ? `${channels.distinctCollaborators.toLocaleString()} people share channels with you`
          : null
      }
    >
      <Facts>
        <Fact label="Followers" value={user.counts.followers.toLocaleString()} />
        <Fact
          label="Following"
          value={user.counts.following.toLocaleString()}
          hint={
            following
              ? `${following.users.toLocaleString()} people · ${following.channels.toLocaleString()} channels · ${following.groups.toLocaleString()} groups`
              : null
          }
        />
        <Fact label="Follower ratio" value={ratio} hint="followers per follow" />
        <Fact
          label="Shared channels"
          value={(channels?.collaborative ?? 0).toLocaleString()}
          hint={`${(channels?.groupOwned ?? 0).toLocaleString()} owned by a group`}
        />
      </Facts>

      {collaborators.length > 0 && (
        <div className={styles.block}>
          <Subheading>Most frequent collaborators</Subheading>
          <ul className={styles.people}>
            {collaborators.map((person) => (
              <li key={person.slug} className={styles.person}>
                <a
                  href={`https://www.are.na/${person.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.personLink}
                >
                  <Avatar person={person} />
                  <span className={styles.personName}>{person.name}</span>
                </a>
                <span className={styles.personCount}>{person.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {groups.length > 0 && (
        <div className={styles.block}>
          <Subheading>Groups you belong to</Subheading>
          <ul className={styles.people}>
            {groups.map((group) => (
              <li key={group.id} className={styles.person}>
                <a
                  href={`https://www.are.na/${group.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.personLink}
                >
                  <Avatar person={group} />
                  <span className={styles.personName}>{group.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {followers?.users?.length > 0 && (
        <div className={styles.block}>
          <Subheading>Newest followers</Subheading>
          <ul className={styles.people}>
            {followers.users.map((person) => (
              <li key={person.id} className={styles.person}>
                <a
                  href={`https://www.are.na/${person.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.personLink}
                >
                  <Avatar person={person} />
                  <span className={styles.personName}>{person.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!following && !groups.length && !followers && !collaborators.length && (
        <Empty>No social data available</Empty>
      )}
    </Section>
  )
})
