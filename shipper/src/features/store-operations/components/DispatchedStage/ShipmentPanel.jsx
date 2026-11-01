import { Link } from 'react-router-dom'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import StatusBadge from '@/components/atoms/StatusBadge'
import Alert from '@/components/molecules/Alert'
import SummaryRows from '@/components/molecules/SummaryRows'
import Timeline from '@/components/molecules/Timeline'
import { env } from '@/app/config/env'
import { paths } from '@/app/router/paths'
import { formatDate, formatShortDateTime } from '@/lib/date'
import WorkPanel, { PanelNote, PanelSection } from '@/features/store-operations/components/WorkPanel'
import { useWorkOrder } from '@/features/store-operations/hooks/useStoreOperations'
import { formatParcelWeight } from '@/features/store-operations/utils/formatParcel'
import styles from './ShipmentPanel.module.scss'

const toTimelineItems = (steps) =>
  steps.map((step) => ({
    key: step.key,
    title: step.title,
    timestamp: [step.at ? formatShortDateTime(step.at) : null, step.note].filter(Boolean).join(' · '),
    status: step.state,
  }))

/** Status, consignment, expected delivery and tracking timeline of one dispatched order. Also used in the Shipping page's drawer. */
export function ShipmentDetails({ order }) {
  const { shipment } = order

  return (
    <>
      <PanelSection>
        <div className={styles.status}>
          <StatusBadge status={shipment.status} />
          <span className={styles.service}>
            {formatParcelWeight(shipment.weightKg)} · {shipment.service}
          </span>
        </div>
        <a className={styles.tracking} href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer">
          {shipment.consignmentId}
          <Icon name="arrow-up-right" />
          <span className="visually-hidden"> (opens India Post tracking in a new tab)</span>
        </a>
        <SummaryRows rows={[{ label: 'Expected delivery', value: formatDate(shipment.expectedDelivery) }]} />
        {order.delay && (
          <Alert tone="warning" action={<Link to={paths.admin.storeTab('delayed')}>View exception</Link>}>
            {order.delay.detail}
          </Alert>
        )}
      </PanelSection>

      <PanelSection divided className={styles.timeline}>
        <Timeline items={toTimelineItems(order.tracking)} />
        {env.useMockApi && <PanelNote>Tracking events are development fixtures: India Post tracking sync is not integrated.</PanelNote>}
      </PanelSection>

      <div className={styles.actions}>
        <Button as={Link} to={paths.admin.order(order.orderNumber)} variant="secondary" size="sm">
          View order
        </Button>
        <Button as="a" href={`mailto:${order.customer.email}`} variant="secondary" size="sm">
          Contact customer
        </Button>
      </div>
    </>
  )
}

/** The Shipment details panel of the Dispatched tab. */
export default function ShipmentPanel({ orderNumber }) {
  const query = useWorkOrder(orderNumber)

  return (
    <WorkPanel
      title={orderNumber ? `Shipment details · #${orderNumber}` : 'Shipment details'}
      orderNumber={orderNumber}
      query={query}
      emptyTitle="Select a shipment"
      emptyDescription="Choose a shipment from the list to follow it with India Post."
    >
      {(order) => <ShipmentDetails order={order} />}
    </WorkPanel>
  )
}
