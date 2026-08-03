import { memo } from 'react'
import Section, { Empty, Fact, Facts, Subheading } from './ui/Section'
import Bars from './ui/Bars'
import StackedBar from './ui/StackedBar'
import { VISIBILITY_COLORS } from '../utils/palette'
import styles from './ChannelsPanel.module.css'

const SIZE_ORDER = ['0', '1–10', '11–50', '51–100', '101+']

export default memo(function ChannelsPanel({ channels }) {
  if (!channels || channels.total === 0) {
    return (
      <Section title="Your Channels">
        <Empty>No channels yet</Empty>
      </Section>
    )
  }

  const visibility = ['public', 'closed', 'private'].map((key) => ({
    key,
    label: key[0].toUpperCase() + key.slice(1),
    count: channels.byVisibility[key] ?? 0,
    color: VISIBILITY_COLORS[key],
  }))

  const sizes = SIZE_ORDER.map((bucket) => ({
    label: bucket,
    count: channels.byBlockSize[bucket] ?? 0,
    color: 'var(--chart-2)',
  }))

  return (
    <Section
      title="Your Channels"
      note={`${channels.owned.toLocaleString()} yours · ${channels.collaborating.toLocaleString()} shared with you`}
    >
      <StackedBar segments={visibility} total={channels.total} />

      <div className={styles.split}>
        <div>
          <Subheading>Size distribution</Subheading>
          <Bars items={sizes} labelWidth="6.5ch" />
        </div>
        <div>
          <Subheading>Shape of the collection</Subheading>
          <Facts>
            <Fact
              label="Median size"
              value={channels.medianContents.toLocaleString()}
              hint={`mean ${channels.averageContents.toLocaleString()}`}
            />
            <Fact
              label="Empty"
              value={channels.emptyChannels.toLocaleString()}
              hint="no contents yet"
            />
            <Fact
              label="Nested"
              value={channels.nestedChannels.toLocaleString()}
              hint={`${channels.subChannelLinks.toLocaleString()} channel-in-channel links`}
            />
            <Fact
              label="Untouched 1 yr+"
              value={channels.idle.over1Year.toLocaleString()}
              hint={`${channels.idle.over6Months.toLocaleString()} untouched 6 months+`}
            />
          </Facts>
        </div>
      </div>
    </Section>
  )
})
