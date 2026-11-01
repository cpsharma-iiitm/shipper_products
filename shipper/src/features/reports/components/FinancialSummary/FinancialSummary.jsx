import StatCard from '@/components/molecules/StatCard'
import { StatGrid } from '@/features/admin-lists'
import { formatINR, formatNumber } from '@/lib/format'

/** Headline figures of the financial report. `summary` comes from the API; nothing here is totalled. */
export default function FinancialSummary({ summary }) {
  const money = (value) => formatINR(value, { decimals: 2 })
  return (
    <StatGrid>
      <StatCard label="Orders in report" value={formatNumber(summary.orders)} delta={`${formatNumber(summary.lineItems)} product line items`} deltaTone="success" />
      <StatCard label="Taxable value" value={money(summary.taxableValue)} delta="Before shipping · GST excluded" deltaTone="success" />
      <StatCard label="GST / shipping" value={money(summary.gstTotal)} delta={`Shipping ${money(summary.shippingTotal)} additional`} deltaTone="success" />
      <StatCard label="Gross amount" value={money(summary.grossAmount)} delta={`Wallet used ${money(summary.walletUsed)}`} deltaTone="success" />
    </StatGrid>
  )
}
