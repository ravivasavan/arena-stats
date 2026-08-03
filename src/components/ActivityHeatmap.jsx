import { memo, useMemo, useState } from 'react'
import Section from './ui/Section'
import { MONTH_NAMES, dayKey, pluralise } from '../utils/format'
import styles from './ActivityHeatmap.module.css'

function buildYear(year, calendar) {
  const start = new Date(year, 0, 1)
  start.setDate(start.getDate() - start.getDay()) // back up to Sunday
  const end = new Date(year, 11, 31)
  end.setDate(end.getDate() + (6 - end.getDay())) // forward to Saturday

  const weeks = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const week = { key: dayKey(cursor), days: [] }
    for (let i = 0; i < 7; i++) {
      const inYear = cursor.getFullYear() === year
      const key = dayKey(cursor)
      week.days.push({
        key,
        inYear,
        month: cursor.getMonth(),
        label: `${cursor.getDate()} ${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`,
        count: inYear ? calendar[key] ?? 0 : null,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  // Label a column with its month the first time that month appears.
  let previousMonth = null
  for (const week of weeks) {
    const firstInYear = week.days.find((day) => day.inYear)
    const month = firstInYear ? firstInYear.month : null
    week.label = month !== null && month !== previousMonth ? MONTH_NAMES[month] : ''
    if (month !== null) previousMonth = month
  }

  return weeks
}

function levelFor(count, max) {
  if (!count) return 0
  if (max <= 4) return Math.min(4, count)
  const ratio = count / max
  if (ratio <= 0.1) return 1
  if (ratio <= 0.3) return 2
  if (ratio <= 0.6) return 3
  return 4
}

export default memo(function ActivityHeatmap({ calendar, years }) {
  const available = years?.length ? years : [new Date().getFullYear()]
  const [year, setYear] = useState(available[available.length - 1])
  const activeYear = available.includes(year) ? year : available[available.length - 1]

  const { weeks, max, total, activeDays } = useMemo(() => {
    const built = buildYear(activeYear, calendar ?? {})
    let peak = 0
    let sum = 0
    let days = 0
    for (const week of built) {
      for (const day of week.days) {
        if (day.count) {
          peak = Math.max(peak, day.count)
          sum += day.count
          days++
        }
      }
    }
    return { weeks: built, max: peak, total: sum, activeDays: days }
  }, [activeYear, calendar])

  return (
    <Section
      title="Activity Calendar"
      note={`${pluralise(total, 'block')} across ${pluralise(activeDays, 'day')} in ${activeYear}`}
      actions={
        <div className={styles.years}>
          {available.map((y) => (
            <button
              key={y}
              type="button"
              className={`${styles.year} ${y === activeYear ? styles.yearActive : ''}`}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      }
    >
      <div className={styles.scroller}>
        <div className={styles.grid}>
          <div className={styles.months}>
            {weeks.map((week) => (
              <span key={week.key} className={styles.month}>
                {week.label}
              </span>
            ))}
          </div>
          <div className={styles.cells}>
            {weeks.map((week) => (
              <div key={week.key} className={styles.week}>
                {week.days.map((day) => (
                  <div
                    key={day.key}
                    className={`${styles.cell} ${day.inYear ? '' : styles.outside}`}
                    style={
                      day.inYear
                        ? { background: `var(--heat-${levelFor(day.count, max)})` }
                        : undefined
                    }
                    title={day.inYear ? `${day.label} — ${pluralise(day.count, 'block')}` : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.scale}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={styles.cell}
            style={{ background: `var(--heat-${level})` }}
          />
        ))}
        <span>More</span>
      </div>
    </Section>
  )
})
