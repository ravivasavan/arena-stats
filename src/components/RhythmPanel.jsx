import { memo } from 'react'
import Section, { Empty, Subheading } from './ui/Section'
import Bars from './ui/Bars'
import Columns from './ui/Columns'
import { MONTH_NAMES, WEEKDAY_NAMES, pluralise } from '../utils/format'
import styles from './RhythmPanel.module.css'

function peakHourLabel(byHour) {
  let best = 0
  for (let h = 1; h < 24; h++) if (byHour[h] > byHour[best]) best = h
  const suffix = best < 12 ? 'am' : 'pm'
  const hour = best % 12 === 0 ? 12 : best % 12
  return `${hour}${suffix}`
}

export default memo(function RhythmPanel({ blocks }) {
  if (!blocks || blocks.empty) {
    return (
      <Section title="Your Rhythm">
        <Empty />
      </Section>
    )
  }

  const months = blocks.months.map((m) => ({
    key: m.key,
    count: m.count,
    tick: m.month === 0 ? String(m.year) : '',
    title: `${MONTH_NAMES[m.month]} ${m.year} — ${pluralise(m.count, 'block')}`,
  }))

  const weekdays = WEEKDAY_NAMES.map((name, i) => ({
    label: name,
    count: blocks.byWeekday[i],
    color: 'var(--chart-1)',
  }))

  const hours = blocks.byHour.map((count, hour) => ({
    key: hour,
    count,
    tick: hour % 6 === 0 ? String(hour).padStart(2, '0') : '',
    title: `${String(hour).padStart(2, '0')}:00 — ${pluralise(count, 'block')}`,
  }))

  const busiestWeekday = weekdays.reduce((best, d) => (d.count > best.count ? d : best), weekdays[0])

  return (
    <Section
      title="Your Rhythm"
      note={`Busiest on ${busiestWeekday.label}s, around ${peakHourLabel(blocks.byHour)}`}
    >
      <Subheading>Every month since you joined</Subheading>
      <div className={styles.scroller}>
        <div style={{ minWidth: `${Math.max(months.length * 6, 280)}px` }}>
          <Columns items={months} height={110} color="var(--chart-1)" />
        </div>
      </div>

      <div className={styles.split}>
        <div>
          <Subheading>Day of week</Subheading>
          <Bars items={weekdays} labelWidth="3.5ch" />
        </div>
        <div>
          <Subheading>Hour of day (your local time)</Subheading>
          <Columns items={hours} height={80} color="var(--chart-5)" />
        </div>
      </div>
    </Section>
  )
})
