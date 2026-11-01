import Card from '@/components/atoms/Card'
import { formatDate, formatDateRange, formatShortDate } from '@/lib/date'
import { formatINR } from '@/lib/format'
import LineChart from '@/features/reports/components/LineChart'
import styles from './SalesAnalyticsCard.module.scss'

/** Daily gross sales for the period against its comparison. `sales` and `period` come from the overview API. */
export default function SalesAnalyticsCard({ sales, period, busy }) {
  const periodText = period.label ?? formatDateRange(period.from, period.to)
  const series = sales.series.map((entry) => ({
    key: entry.key,
    variant: entry.key,
    label: entry.label,
    total: entry.total,
    points: entry.points.map((point) => ({ label: formatDate(point.date), axisLabel: formatShortDate(point.date), value: point.value })),
  }))

  return (
    <Card title="Sales analytics" padding="md" radius="md" className={styles.card}>
      <p className={styles.subtitle}>Daily gross sales · {periodText}</p>
      <LineChart
        title={`Daily gross sales, ${periodText}.`}
        yAxisLabel="Revenue (₹)"
        series={series}
        formatValue={(value) => formatINR(value)}
        height={156}
        busy={busy}
      />
    </Card>
  )
}
