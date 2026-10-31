import SummaryRows from '@/components/molecules/SummaryRows'
import { formatINR, pluralize } from '@/lib/format'
import styles from './QuoteSummary.module.scss'

const money = (value) => formatINR(value, { decimals: 2 })
const deduction = (value) => `− ${money(value)}`

/**
 * Every figure of a backend cart quote: items, taxable subtotal, GST, shipping, gross amount, coupon,
 * wallet and "To pay". Nothing is calculated here; the rows only format what `quote.summary` says.
 * Rows that do not apply (no coupon, no wallet) are left out, free shipping reads "Free". A placed order's
 * `summary` has the same figures, so it can be shown the same way with `totalLabel="Total paid"`.
 * `compact` is the phone artboard: taxable subtotal and GST first, then what they add up to, in one unbroken list.
 */
export default function QuoteSummary({ quote, totalLabel = 'To pay', compact = false }) {
  const { summary, coupon } = quote

  const taxableRow = { label: 'Taxable subtotal', value: money(summary.taxableSubtotal) }
  const gstRow = { label: 'GST', value: money(summary.gstTotal) }
  const itemsRow = {
    label: compact ? 'Items incl. GST' : `Items (${pluralize(summary.units, 'unit')}) · incl. GST`,
    value: money(summary.itemsTotal),
  }
  const shippingRow = { label: 'Shipping', value: summary.shipping > 0 ? money(summary.shipping) : 'Free', tone: summary.shipping > 0 ? undefined : 'success' }
  const itemRows = compact ? [taxableRow, gstRow, itemsRow, shippingRow] : [itemsRow, taxableRow, gstRow, shippingRow]

  const adjustmentRows = [
    { label: 'Gross amount', value: money(summary.grossAmount) },
    summary.couponDiscount > 0 && { label: coupon?.code ? `Coupon ${coupon.code}` : 'Coupon discount', value: deduction(summary.couponDiscount), tone: 'success' },
    summary.walletApplied > 0 && { label: 'Wallet applied', value: deduction(summary.walletApplied) },
  ].filter(Boolean)

  return (
    <div>
      {compact ? (
        <SummaryRows rows={[...itemRows, ...adjustmentRows]} />
      ) : (
        <>
          <SummaryRows rows={itemRows} />
          <SummaryRows rows={adjustmentRows} className={styles.group} />
        </>
      )}
      <div className={styles.total}>
        <span className={styles.totalLabel}>{totalLabel}</span>
        <strong className={styles.totalValue}>{money(summary.payable)}</strong>
      </div>
      <span className="visually-hidden" role="status">
        {totalLabel} {money(summary.payable)}
      </span>
    </div>
  )
}
