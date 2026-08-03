import { memo } from 'react'
import Section, { Empty } from './ui/Section'
import { formatRelative, pluralise } from '../utils/format'
import styles from './ChannelList.module.css'

const METRICS = {
  size: (channel) => `${(channel.counts?.contents ?? 0).toLocaleString()} blocks`,
  updated: (channel) => formatRelative(channel.updatedAt),
  lifespan: (channel) => pluralise(channel.lifespanDays ?? 0, 'day'),
  collaborators: (channel) => pluralise(channel.counts?.collaborators ?? 0, 'person', 'people'),
}

export default memo(function ChannelList({ title, channels, userSlug, metric = 'size' }) {
  if (!channels?.length) {
    return (
      <Section title={title}>
        <Empty>Nothing here yet</Empty>
      </Section>
    )
  }

  const describe = METRICS[metric] ?? METRICS.size

  return (
    <Section title={title}>
      <ol className={styles.list}>
        {channels.map((channel) => (
          <li key={channel.id} className={styles.item}>
            <a
              className={styles.name}
              href={`https://www.are.na/${channel.owner?.slug ?? userSlug}/${channel.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {channel.title}
            </a>
            {channel.owner?.slug && channel.owner.slug !== userSlug && (
              <span className={styles.owner}>{channel.owner.name}</span>
            )}
            <span className={styles.metric}>{describe(channel)}</span>
          </li>
        ))}
      </ol>
    </Section>
  )
})
