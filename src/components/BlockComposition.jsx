import { memo } from 'react'
import Section, { Empty, Fact, Facts, Subheading } from './ui/Section'
import StackedBar from './ui/StackedBar'
import { typeSegments, VISIBILITY_COLORS } from '../utils/palette'
import { formatCompact } from '../utils/format'
import styles from './BlockComposition.module.css'

export default memo(function BlockComposition({ blocks }) {
  if (!blocks || blocks.empty) {
    return (
      <Section title="What You Collect">
        <Empty>No blocks yet</Empty>
      </Section>
    )
  }

  const visibility = Object.entries(blocks.byVisibility ?? {}).map(([key, count]) => ({
    key,
    label: key[0].toUpperCase() + key.slice(1),
    count,
    color: VISIBILITY_COLORS[key] ?? 'var(--chart-1)',
  }))

  const { portrait, landscape, square } = blocks.orientation
  const images = portrait + landscape + square

  return (
    <Section
      title="What You Collect"
      note={`${blocks.sampled.toLocaleString()} blocks analysed`}
    >
      <StackedBar
        segments={typeSegments(blocks.byType, blocks.typeOrder)}
        total={blocks.sampled}
      />

      <div className={styles.split}>
        {visibility.length > 1 && (
          <div>
            <Subheading>Visibility</Subheading>
            <StackedBar segments={visibility} total={blocks.sampled} />
          </div>
        )}
        <div>
          <Subheading>Character</Subheading>
          <Facts>
            <Fact
              label="Titled"
              value={`${Math.round((blocks.titled / blocks.sampled) * 100)}%`}
              hint={`${blocks.untitled.toLocaleString()} untitled`}
            />
            <Fact
              label="Words written"
              value={formatCompact(blocks.words)}
              hint="in text blocks"
            />
            <Fact
              label="Comments"
              value={blocks.comments.total.toLocaleString()}
              hint={`on ${blocks.comments.blocks.toLocaleString()} blocks`}
            />
            {images > 0 && (
              <Fact
                label="Image shape"
                value={
                  portrait >= landscape && portrait >= square
                    ? 'Portrait'
                    : landscape >= square
                      ? 'Landscape'
                      : 'Square'
                }
                hint={`${portrait} / ${landscape} / ${square} p·l·s`}
              />
            )}
          </Facts>
        </div>
      </div>
    </Section>
  )
})
