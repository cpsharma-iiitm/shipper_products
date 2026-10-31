import Card from '@/components/atoms/Card'
import SummaryRows from '@/components/molecules/SummaryRows'
import { formatINR } from '@/lib/format'

const money = (value) => formatINR(value, { decimals: 2 })

/** The amounts stored on the order. Every figure was calculated by the backend when the order was placed. */
export default function OrderSummaryCard({ summary, paymentStatus }) {
  const gstRows = summary.igst > 0 ? [{ label: 'IGST', value: money(summary.igst) }] : [{ label: 'CGST', value: money(summary.cgst) }, { label: 'SGST', value: money(summary.sgst) }]
  const rows = [
    { label: 'Taxable subtotal', value: money(summary.taxableSubtotal) },
    ...gstRows,
    { label: 'Shipping', value: summary.shipping > 0 ? money(summary.shipping) : 'Free' },
    ...(summary.couponDiscount > 0 ? [{ label: 'Coupon discount', value: `−${money(summary.couponDiscount)}`, tone: 'success' }] : []),
    { label: 'Gross amount', value: money(summary.grossAmount) },
    ...(summary.walletApplied > 0 ? [{ label: 'Wallet applied', value: `−${money(summary.walletApplied)}`, tone: 'success' }] : []),
    { label: paymentStatus === 'paid' ? 'Paid via Razorpay' : 'Payable via Razorpay', value: money(summary.payable), emphasis: true },
  ]

  return (
    <Card title="Order summary" padding="md" radius="md">
      <SummaryRows rows={rows} />
    </Card>
  )
}
