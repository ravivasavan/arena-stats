import { memo } from 'react'
import Section, { Empty } from './ui/Section'
import { pluralise } from '../utils/format'
// Same visual treatment as the channel lists — one ranked list of links.
import styles from './ChannelList.module.css'

export default memo(function BlockList({ title, blocks, describe }) {
  if (!blocks?.length) {
    return (
      <Section title={title}>
        <Empty>Nothing here yet</Empty>
      </Section>
    )
  }

  return (
    <Section title={title}>
      <ol className={styles.list}>
        {blocks.map((block) => (
          <li key={block.id} className={styles.item}>
            <a
              className={styles.name}
              href={`https://www.are.na/block/${block.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {block.title || `Untitled ${block.type.toLowerCase()}`}
            </a>
            <span className={styles.metric}>
              {describe ? describe(block) : pluralise(block.comments, 'comment')}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  )
})
