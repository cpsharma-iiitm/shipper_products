import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import RevenueChart from '@/features/dashboard/components/RevenueChart'
import styles from './SalesOverviewCard.module.scss'

/** Revenue trend for the selected period against the period before it. */
export default function SalesOverviewCard({ rangeLabel, series, className }) {
  return (
    <Card title="Sales overview" radius="md" padding="md" className={className}>
      {series ? (
        <>
          <p className={styles.range}>{rangeLabel} · Gross sales include GST</p>
          <div className={styles.legendRow}>
            <p className={styles.axisTitle}>Revenue (₹)</p>
            <ul className={styles.legend} aria-label="Chart legend">
              <li>
                <span className={styles.currentKey} aria-hidden="true" />
                {series.currentLabel}
              </li>
              <li>
                <span className={styles.previousKey} aria-hidden="true" />
                {series.previousLabel}
              </li>
            </ul>
          </div>
          <RevenueChart points={series.points} currentLabel={series.currentLabel} previousLabel={series.previousLabel} />
        </>
      ) : (
        <div className={styles.loading} aria-hidden="true">
          <Skeleton width="45%" height="0.875rem" />
          <Skeleton height="6.25rem" radius="8px" />
        </div>
      )}
    </Card>
  )
}
