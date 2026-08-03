import { memo } from 'react'
import Section, { Empty, Fact, Facts } from './ui/Section'
import { MONTH_NAMES, formatDay, pluralise } from '../utils/format'
import styles from './PacePanel.module.css'

function delta(current, previous) {
  if (!previous) return current > 0 ? 'first year at this pace' : null
  const change = Math.round(((current - previous) / previous) * 100)
  if (change === 0) return 'level with last year'
  return `${change > 0 ? '+' : ''}${change}% vs same point last year`
}

export default memo(function PacePanel({ blocks }) {
  if (!blocks || blocks.empty) {
    return (
      <Section title="Pace">
        <Empty />
      </Section>
    )
  }

  const { pace, streaks, activeDays, busiestDay, busiestMonth } = blocks
  const thisYear = new Date().getFullYear()
  const trend = delta(pace.thisYear, pace.lastYearToDate)

  return (
    <Section title="Pace" note={trend}>
      <Facts>
        <Fact
          label={`${thisYear} so far`}
          value={pace.thisYear.toLocaleString()}
          hint={`${pace.lastYearToDate.toLocaleString()} by now last year`}
        />
        <Fact label="Last 30 days" value={pace.last30.toLocaleString()} hint={`${pace.last90.toLocaleString()} in 90`} />
        <Fact
          label="Per week"
          value={pace.perWeek.toFixed(1)}
          hint={`across ${pluralise(Math.max(1, Math.round(pace.lifetimeDays / 365.25)), 'year')}`}
        />
        <Fact
          label="Active days"
          value={activeDays.toLocaleString()}
          hint={`${Math.round((activeDays / pace.lifetimeDays) * 100)}% of your account life`}
        />
        <Fact
          label="Per active day"
          value={pace.perActiveDay.toFixed(1)}
          hint="blocks when you show up"
        />
        <Fact
          label="Longest streak"
          value={pluralise(streaks.longest, 'day')}
          hint={
            streaks.longestStart
              ? streaks.longestStart === streaks.longestEnd
                ? formatDay(streaks.longestStart)
                : `${formatDay(streaks.longestStart)} → ${formatDay(streaks.longestEnd)}`
              : null
          }
        />
        <Fact
          label="Current streak"
          value={pluralise(streaks.current, 'day')}
          hint={streaks.current ? 'keep going' : 'nothing running'}
        />
        {busiestDay && (
          <Fact
            label="Biggest day"
            value={busiestDay.count.toLocaleString()}
            hint={formatDay(busiestDay.day)}
          />
        )}
        {busiestMonth && (
          <Fact
            label="Biggest month"
            value={busiestMonth.count.toLocaleString()}
            hint={`${MONTH_NAMES[busiestMonth.month]} ${busiestMonth.year}`}
          />
        )}
      </Facts>
      {!blocks.complete && (
        <p className={styles.partial}>Still loading blocks — these figures will settle.</p>
      )}
    </Section>
  )
})
