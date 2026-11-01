import clsx from 'clsx'
import { formatNumber } from '@/lib/format'
import styles from './ResultsSummary.module.scss'

/** "Showing 1–12 of 118 products". Announced politely when the results change. */
export default function ResultsSummary({ page, pageSize, totalItems, className }) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <p className={clsx(styles.summary, className)} aria-live="polite">
      {totalItems === 0 ? 'No products found' : `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(totalItems)} products`}
    </p>
  )
}
