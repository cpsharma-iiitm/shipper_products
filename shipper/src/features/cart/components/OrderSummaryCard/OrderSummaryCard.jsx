import clsx from 'clsx'
import Card from '@/components/atoms/Card'
import { formatINR } from '@/lib/format'
import QuoteSummary from '@/features/cart/components/QuoteSummary'
import styles from './OrderSummaryCard.module.scss'

/**
 * Card around the backend quote: title, optional product lines, the figures and an action area
 * (`children`) such as "Continue to checkout" or "Pay securely". It dims while a newer quote is loading.
 * `compact` is the phone layout: tighter padding and the phone artboard's order of rows.
 */
export default function OrderSummaryCard({ quote, title = 'Order summary', showLines = false, compact = false, busy = false, className, children }) {
  return (
    <Card title={title} padding={compact ? 'sm' : 'md'} className={clsx(styles.card, busy && styles.busy, className)} aria-busy={busy || undefined}>
      {showLines && (
        <ul className={styles.lines}>
          {quote.lines.map((line) => (
            <li key={line.productCode} className={styles.line}>
              <span>
                {line.name} <span aria-hidden="true">×</span>
                <span className="visually-hidden">quantity </span>
                {line.quantity}
              </span>
              <span className={styles.amount}>{formatINR(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
      )}
      <QuoteSummary quote={quote} compact={compact} />
      {children}
    </Card>
  )
}
