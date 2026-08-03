import { memo } from 'react'
import Section, { Empty, Subheading } from './ui/Section'
import Bars from './ui/Bars'
import styles from './SourcesPanel.module.css'

export default memo(function SourcesPanel({ blocks }) {
  const hosts = blocks?.topHosts ?? []
  const extensions = blocks?.topExtensions ?? []

  if (!hosts.length && !extensions.length) {
    return (
      <Section title="Where It Comes From">
        <Empty>No linked or uploaded sources yet</Empty>
      </Section>
    )
  }

  return (
    <Section
      title="Where It Comes From"
      note={
        blocks?.distinctHosts
          ? `${blocks.distinctHosts.toLocaleString()} distinct domains`
          : null
      }
    >
      {hosts.length > 0 && (
        <>
          <Subheading>Top domains</Subheading>
          <Bars
            items={hosts.map((host) => ({
              label: host.label,
              count: host.count,
              href: `https://${host.label}`,
              color: 'var(--chart-2)',
            }))}
            labelWidth="20ch"
          />
        </>
      )}

      {extensions.length > 0 && (
        <div className={styles.files}>
          <Subheading>Uploaded file types</Subheading>
          <Bars
            items={extensions.map((ext) => ({
              label: ext.label,
              count: ext.count,
              color: 'var(--chart-4)',
            }))}
            labelWidth="6ch"
          />
        </div>
      )}
    </Section>
  )
})
