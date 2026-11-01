import StatCard from '@/components/molecules/StatCard'
import { StatGrid } from '@/features/admin-lists'
import { formatINR, formatNumber, formatPercent } from '@/lib/format'

/** "↑ 12.8% vs previous period" — the change is calculated by the backend; null means no comparison. */
function changeText(changePercent) {
  if (changePercent === null || changePercent === undefined) return undefined
  return `${changePercent >= 0 ? '↑' : '↓'} ${formatPercent(Math.abs(changePercent))} vs previous period`
}

/** The four headline figures of the Reports overview. */
export default function ReportKpis({ summary }) {
  const gross = summary.grossSales
  const average = summary.averageOrderValue
  const wallet = summary.walletLiability

  return (
    <StatGrid>
      <StatCard label="Gross sales" value={formatINR(gross.value)} delta={changeText(gross.changePercent)} deltaTone={gross.changePercent < 0 ? 'danger' : 'success'} />
      <StatCard label="GST collected" value={formatINR(summary.gstCollected.value)} delta="Tax-inclusive reporting" deltaTone="success" />
      <StatCard label="Average order value" value={formatINR(average.value)} delta={changeText(average.changePercent)} deltaTone={average.changePercent < 0 ? 'danger' : 'success'} />
      <StatCard
        label="Wallet liability"
        value={formatINR(wallet.value)}
        delta={`${formatNumber(wallet.customersWithBalance)} customers with balance`}
        deltaTone="success"
      />
    </StatGrid>
  )
}
