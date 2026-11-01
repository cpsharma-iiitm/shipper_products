import StatCard from '@/components/molecules/StatCard'
import { STATUS_META } from '@/app/config/statuses'
import { formatNumber } from '@/lib/format'
import styles from './ShipmentStatusCards.module.scss'

const SHIPMENT_STATUSES = ['dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'returned']

/**
 * One card per shipment status with the number the backend reports. Choosing a card filters the list to
 * that status; choosing it again shows every status.
 */
export default function ShipmentStatusCards({ byStatus, selected, onSelect }) {
  return (
    <ul className={styles.cards} aria-label="Shipments by status">
      {SHIPMENT_STATUSES.map((status) => (
        <li key={status}>
          <StatCard
            layout="inline"
            className={styles.card}
            label={STATUS_META[status].label}
            value={byStatus ? formatNumber(byStatus[status] ?? 0) : '—'}
            selected={selected === status}
            onClick={() => onSelect(selected === status ? 'all' : status)}
          />
        </li>
      ))}
    </ul>
  )
}
