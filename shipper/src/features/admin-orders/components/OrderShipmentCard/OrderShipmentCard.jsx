import Card from '@/components/atoms/Card'
import StatusBadge from '@/components/atoms/StatusBadge'
import SummaryRows from '@/components/molecules/SummaryRows'
import Timeline from '@/components/molecules/Timeline'
import { formatDate, formatDateTime, formatShortDateTime } from '@/lib/date'
import { formatWeightKg } from '@/lib/format'
import styles from './OrderShipmentCard.module.scss'

/**
 * Shipment details and the order's progress timeline. The steps, their states and timestamps are produced by
 * the backend; the card only formats them.
 */
export default function OrderShipmentCard({ shipment, timeline }) {
  const steps = timeline.map((step) => ({
    key: step.key,
    title: step.title,
    description: step.note,
    timestamp: step.at ? formatShortDateTime(step.at) : undefined,
    status: step.state,
  }))
  const rows = shipment
    ? [
        { label: 'Carrier', value: `${shipment.carrier} · ${shipment.service}` },
        { label: 'Consignment ID', value: shipment.consignmentId },
        { label: 'Status', value: <StatusBadge status={shipment.status} /> },
        { label: 'Weight', value: formatWeightKg(shipment.weightKg) },
        { label: 'Dimensions', value: `${shipment.dimensionsCm.length} × ${shipment.dimensionsCm.width} × ${shipment.dimensionsCm.height} cm` },
        { label: 'Dispatched', value: formatDateTime(shipment.dispatchedAt) },
        { label: shipment.deliveredAt ? 'Delivered' : 'Expected delivery', value: shipment.deliveredAt ? formatDateTime(shipment.deliveredAt) : formatDate(shipment.expectedDelivery) },
      ]
    : null

  return (
    <Card title="Shipment & tracking" padding="md" radius="md">
      <div className={styles.body}>
        {rows ? <SummaryRows rows={rows} className={styles.rows} /> : <p className={styles.empty}>This order has not been handed to the carrier yet.</p>}
        <Timeline items={steps} />
      </div>
    </Card>
  )
}
