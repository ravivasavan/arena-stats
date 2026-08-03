import { memo } from 'react'
import Section, { Empty, Subheading } from './ui/Section'
import StackedBar from './ui/StackedBar'
import { colorForType } from '../utils/palette'
import { formatBytes } from '../utils/format'
import styles from './StoragePanel.module.css'

export default memo(function StoragePanel({ blocks }) {
  const storage = blocks?.storage
  if (!storage?.totalBytes) {
    return (
      <Section title="Footprint">
        <Empty>Nothing uploaded yet</Empty>
      </Section>
    )
  }

  const segments = Object.entries(storage.byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, bytes]) => ({
      key: type,
      label: type,
      count: bytes,
      color: colorForType(type),
    }))

  return (
    <Section
      title="Footprint"
      note={`${formatBytes(storage.totalBytes)} of images and files you've uploaded`}
    >
      <StackedBar segments={segments} formatValue={formatBytes} />

      <div className={styles.largest}>
        <Subheading>Largest files</Subheading>
        <ol className={styles.list}>
          {storage.largestFiles.map((block) => (
            <li key={block.id} className={styles.item}>
              <a
                className={styles.name}
                href={`https://www.are.na/block/${block.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {block.title || `Untitled ${block.type.toLowerCase()}`}
              </a>
              <span className={styles.size}>{formatBytes(block.size)}</span>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
})
