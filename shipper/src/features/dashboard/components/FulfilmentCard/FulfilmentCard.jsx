import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Badge from '@/components/atoms/Badge'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import { formatNumber, pluralize } from '@/lib/format'
import styles from './FulfilmentCard.module.scss'

const SEVERITY_TONE = { critical: 'danger', warning: 'warning' }

const METRICS = [
  { key: 'pendingShipments', label: 'Pending shipments' },
  { key: 'readyToDispatch', label: 'Ready to dispatch' },
  { key: 'delayedOrders', label: 'Delayed orders' },
]

/** Queue counts and the stock alerts that need attention today. */
export default function FulfilmentCard({ fulfilment, className }) {
  return (
    <Card title="Fulfilment & inventory" radius="md" padding="md" className={className}>
      {fulfilment ? (
        <>
          <dl className={styles.metrics}>
            {METRICS.map(({ key, label }) => (
              <div key={key} className={styles.metric}>
                <dt>{label}</dt>
                <dd>{formatNumber(fulfilment[key])}</dd>
              </div>
            ))}
          </dl>

          {fulfilment.stockAlerts.length > 0 && (
            <section className={styles.alerts} aria-label={`Low stock alerts: ${pluralize(fulfilment.lowStockCount, 'product')} at or below their threshold`}>
              <ul>
                {fulfilment.stockAlerts.map((alert) => (
                  <li key={alert.productCode} className={styles.alert}>
                    <span>{alert.name}</span>
                    <Badge tone={SEVERITY_TONE[alert.severity] ?? 'warning'}>{alert.stock} left</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link to={paths.admin.storeOperation} className={styles.link}>
            Open Store Operation <span aria-hidden="true">→</span>
          </Link>
        </>
      ) : (
        <div className={styles.loading} aria-hidden="true">
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
        </div>
      )}
    </Card>
  )
}
