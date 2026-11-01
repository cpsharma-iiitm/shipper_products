import Skeleton from '@/components/atoms/Skeleton'
import StatCard from '@/components/molecules/StatCard'
import { formatINR, formatNumber, formatPercent } from '@/lib/format'
import styles from './KpiGrid.module.scss'

const KPI_DEFINITIONS = [
  { key: 'grossSales', label: 'Gross sales', format: formatINR },
  { key: 'netRevenue', label: 'Net revenue', format: formatINR },
  { key: 'orders', label: 'Orders', format: formatNumber },
  { key: 'customers', label: 'Customers', format: formatNumber },
]

const TREND = {
  up: { arrow: '↑', spoken: 'Up', tone: 'success' },
  down: { arrow: '↓', spoken: 'Down', tone: 'danger' },
  flat: { arrow: '→', spoken: 'Unchanged', tone: 'neutral' },
}

// "12.8% vs last month", "8.2% · 42 today", "186 new this month": percent and notes come from the backend.
function describeChange({ changePercent, comparisonLabel, extra }) {
  const change = changePercent === null ? null : [formatPercent(changePercent), comparisonLabel].filter(Boolean).join(' ')
  return [change, extra].filter(Boolean).join(' · ')
}

/** Headline figures for the selected period. `kpis` is null while the first response is loading. */
export default function KpiGrid({ kpis }) {
  return (
    <div className={styles.grid}>
      {KPI_DEFINITIONS.map(({ key, label, format }) => {
        const kpi = kpis?.[key]
        if (!kpi) {
          return (
            <div key={key} className={styles.placeholder} aria-hidden="true">
              <Skeleton width="40%" height="0.875rem" />
              <Skeleton width="60%" height="1.75rem" />
              <Skeleton width="50%" height="0.75rem" />
            </div>
          )
        }
        const trend = TREND[kpi.trend] ?? TREND.flat
        return (
          <StatCard
            key={key}
            label={label}
            size="lg"
            value={format(kpi.value)}
            deltaTone={trend.tone}
            delta={
              <>
                <span aria-hidden="true">{trend.arrow}</span>
                <span className="visually-hidden">{trend.spoken} </span> {describeChange(kpi)}
              </>
            }
          />
        )
      })}
    </div>
  )
}
