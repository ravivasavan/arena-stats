import { memo } from 'react'
import Section, { Empty } from './ui/Section'
import { formatDay, formatRelative, pluralise } from '../utils/format'
import styles from './MilestonesPanel.module.css'

function blockLabel(block) {
  if (!block) return null
  return block.title || `Untitled ${block.type.toLowerCase()}`
}

export default memo(function MilestonesPanel({ user, blocks, channels }) {
  const entries = []

  entries.push({
    key: 'joined',
    when: user.createdAt,
    title: 'Joined Are.na',
    detail: 'Account created',
  })

  if (channels.firstChannel) {
    entries.push({
      key: 'first-channel',
      when: channels.firstChannel.createdAt,
      title: 'First channel',
      detail: channels.firstChannel.title,
      href: `https://www.are.na/${channels.firstChannel.owner?.slug ?? user.slug}/${channels.firstChannel.slug}`,
    })
  }

  if (blocks?.firstBlock) {
    entries.push({
      key: 'first-block',
      when: blocks.firstBlock.date,
      title: 'First block',
      detail: blockLabel(blocks.firstBlock),
      href: `https://www.are.na/block/${blocks.firstBlock.id}`,
    })
  }

  if (channels.longestRunning?.[0]) {
    const oldest = channels.longestRunning[0]
    entries.push({
      key: 'longest',
      when: oldest.createdAt,
      title: 'Longest-running channel',
      detail: `${oldest.title} — tended for ${pluralise(oldest.lifespanDays, 'day')}`,
      href: `https://www.are.na/${oldest.owner?.slug ?? user.slug}/${oldest.slug}`,
    })
  }

  if (channels.newestChannel) {
    entries.push({
      key: 'newest-channel',
      when: channels.newestChannel.createdAt,
      title: 'Newest channel',
      detail: channels.newestChannel.title,
      href: `https://www.are.na/${channels.newestChannel.owner?.slug ?? user.slug}/${channels.newestChannel.slug}`,
    })
  }

  if (blocks?.latestBlock) {
    entries.push({
      key: 'latest-block',
      when: blocks.latestBlock.date,
      title: 'Most recent block',
      detail: blockLabel(blocks.latestBlock),
      href: `https://www.are.na/block/${blocks.latestBlock.id}`,
    })
  }

  if (!entries.length) {
    return (
      <Section title="Milestones">
        <Empty />
      </Section>
    )
  }

  entries.sort((a, b) => new Date(a.when) - new Date(b.when))

  return (
    <Section title="Milestones">
      <ol className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.key} className={styles.item}>
            <span className={styles.date}>{formatDay(entry.when)}</span>
            <span className={styles.body}>
              <span className={styles.title}>{entry.title}</span>
              <span className={styles.detail}>
                {entry.href ? (
                  <a href={entry.href} target="_blank" rel="noopener noreferrer">
                    {entry.detail}
                  </a>
                ) : (
                  entry.detail
                )}
              </span>
            </span>
            <span className={styles.ago}>{formatRelative(entry.when)}</span>
          </li>
        ))}
      </ol>
    </Section>
  )
})
