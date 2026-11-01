import StatCard from '@/components/molecules/StatCard'
import { formatNumber } from '@/lib/format'
import clsx from 'clsx'
import styles from './StageSummary.module.scss'

/**
 * Row of four label / number cards above a queue.
 *   items: [{ key, label, value, tone?: 'warning' | 'danger' | 'info' | 'neutral' }]
 * `value` is the count the backend reports; `tone` colours the number as on the Delayed Orders design.
 */
export default function StageSummary({ items, label }) {
  return (
    <ul className={styles.cards} aria-label={label}>
      {items.map((item) => (
        <li key={item.key}>
          <StatCard
            layout="inline"
            className={styles.card}
            label={item.label}
            value={<span className={clsx(styles.value, item.tone && styles[item.tone])}>{formatNumber(item.value)}</span>}
          />
        </li>
      ))}
    </ul>
  )
}
