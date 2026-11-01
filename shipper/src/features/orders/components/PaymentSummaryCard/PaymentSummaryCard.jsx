import Card from '@/components/atoms/Card'
import SummaryRows from '@/components/molecules/SummaryRows'
import { formatINR } from '@/lib/format'
import styles from './PaymentSummaryCard.module.scss'

const money = (value) => formatINR(value, { decimals: 2 })

/** Label of the closing row, by payment state: "Paid via UPI". */
function paidLabel(order) {
  if (order.paymentStatus === 'paid') return `Paid via ${order.paymentMethod}`
  if (order.paymentStatus === 'refunded') return 'Refunded'
  if (order.paymentStatus === 'failed') return 'Payment failed'
  return 'Payment pending'
}

/**
 * "Payment summary". Every figure is the amount stored with the order by the backend, shown without any
 * arithmetic on this side; coupon and wallet rows appear only when they were used.
 */
export default function PaymentSummaryCard({ order }) {
  const { summary } = order
  const rows = [
    { label: 'Taxable subtotal', value: money(summary.taxableSubtotal) },
    { label: 'GST', value: money(summary.gstTotal) },
    { label: 'Shipping', value: money(summary.shipping) },
    { label: 'Gross amount', value: money(summary.grossAmount) },
    summary.couponDiscount > 0 && { label: 'Coupon', value: money(summary.couponDiscount) },
    summary.walletApplied > 0 && { label: 'Wallet', value: money(summary.walletApplied) },
    { label: paidLabel(order), value: money(summary.payable), emphasis: true },
  ].filter(Boolean)

  return (
    <Card title="Payment summary" padding="md">
      <SummaryRows rows={rows} />
      {(order.razorpayPaymentId || order.invoiceNumber) && (
        <p className={styles.references}>
          {order.razorpayPaymentId && <span>Razorpay · {order.razorpayPaymentId}</span>}
          {order.invoiceNumber && <span>Invoice: {order.invoiceNumber}</span>}
        </p>
      )}
    </Card>
  )
}
