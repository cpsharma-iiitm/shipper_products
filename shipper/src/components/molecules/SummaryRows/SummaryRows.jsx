import clsx from 'clsx'
import styles from './SummaryRows.module.scss'

/**
 * Label / value list for order and checkout summaries.
 *   rows: [{ label, value, tone?: 'success' | 'danger' | 'muted', emphasis?: boolean, hint? }]
 *
 * `value` is displayed exactly as given. Every figure (subtotal, GST, shipping, wallet, total) is
 * calculated and returned by the backend; this component never adds or subtracts anything.
 * An `emphasis` row is the grand total: it gets a divider above and heavier type.
 */
export default function SummaryRows({ rows, className }) {
  return (
    <dl className={clsx(styles.rows, className)}>
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} className={clsx(styles.row, row.emphasis && styles.emphasis, row.tone && styles[row.tone])}>
          <dt className={styles.label}>
            {row.label}
            {row.hint && <span className={styles.hint}>{row.hint}</span>}
          </dt>
          <dd className={styles.value}>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}