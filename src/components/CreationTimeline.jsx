import { memo, useState } from 'react'
import Section, { Empty } from './ui/Section'
import Bars from './ui/Bars'
import { colorForType } from '../utils/palette'
import styles from './CreationTimeline.module.css'

function yearRange(...maps) {
  const years = new Set()
  for (const map of maps) {
    for (const year of Object.keys(map ?? {})) years.add(Number(year))
  }
  if (!years.size) return []
  const sorted = [...years].sort((a, b) => a - b)
  const filled = []
  for (let y = sorted[0]; y <= sorted[sorted.length - 1]; y++) filled.push(y)
  return filled
}

export default memo(function CreationTimeline({ blocks, channelsByYear }) {
  const [mode, setMode] = useState('blocks')
  const blocksByYear = blocks?.byYear ?? {}
  const years = yearRange(blocksByYear, channelsByYear)

  if (!years.length) {
    return (
      <Section title="By Year">
        <Empty />
      </Section>
    )
  }

  // Blocks stream in after channels, so fall back until they arrive.
  const hasBlocks = Boolean(blocks) && !blocks.empty
  const showBlocks = hasBlocks && mode === 'blocks'
  const types = showBlocks ? blocks.typeOrder : []
  const items = years.map((year) => {
    if (showBlocks) {
      const perType = blocks.byYearAndType?.[year] ?? {}
      return {
        label: String(year),
        count: blocksByYear[year] ?? 0,
        segments: types.map((type) => ({
          key: type,
          count: perType[type] ?? 0,
          color: colorForType(type),
        })),
      }
    }
    return {
      label: String(year),
      count: channelsByYear?.[year] ?? 0,
      color: 'var(--color-closed)',
    }
  })

  const busiest = items.reduce((best, item) => (item.count > best.count ? item : best), items[0])

  return (
    <Section
      title="By Year"
      note={busiest.count > 0 ? `Peak: ${busiest.label} (${busiest.count.toLocaleString()})` : null}
      actions={
        <div className={styles.toggle}>
          <button
            type="button"
            className={showBlocks ? styles.active : ''}
            onClick={() => setMode('blocks')}
            disabled={!hasBlocks}
          >
            Blocks
          </button>
          <button
            type="button"
            className={showBlocks ? '' : styles.active}
            onClick={() => setMode('channels')}
          >
            Channels
          </button>
        </div>
      }
    >
      <Bars items={items} />
      {showBlocks && (
        <div className={styles.key}>
          {types.map((type) => (
            <span key={type} className={styles.keyItem}>
              <span className={styles.dot} style={{ background: colorForType(type) }} />
              {type}
            </span>
          ))}
        </div>
      )}
    </Section>
  )
})
