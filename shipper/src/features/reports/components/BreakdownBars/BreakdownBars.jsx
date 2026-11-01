import clsx from 'clsx'
import { formatNumber, formatPercent } from '@/lib/format'
import styles from './BreakdownBars.module.scss'

// Colour follows the status, never its position, so a bar keeps its colour whatever the mix.
const TONES = { delivered: 'success', in_transit: 'primary', pending: 'warning', returned: 'danger' }

/**
 * Share-of-orders bars. items: [{ key, label, count, percent }] — counts and percentages come from the
 * backend. The bar is decoration: the label, count and percentage beside it carry the information.
 */
export default function BreakdownBars({ items, className }) {
  return (
    <ul className={clsx(styles.list, className)}>
      {items.map((item) => (
        <li key={item.key} className={styles.item}>
          <p className={styles.row}>
            <span>{item.label}</span>
            <span>
              {formatNumber(item.count)} · {formatPercent(item.percent)}
            </span>
          </p>
          <span className={styles.track} aria-hidden="true">
            <span className={clsx(styles.bar, styles[TONES[item.key] ?? 'primary'])} style={{ width: `${item.percent}%` }} />
          </span>
        </li>
      ))}
    </ul>
  )
}
