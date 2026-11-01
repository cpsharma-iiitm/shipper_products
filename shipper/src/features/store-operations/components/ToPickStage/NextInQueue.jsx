import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import StatusBadge from '@/components/atoms/StatusBadge'
import { pluralize } from '@/lib/format'
import styles from './NextInQueue.module.scss'

function PriorityBadge({ row }) {
  if (row.onHold) return <StatusBadge status="on_hold" />
  return <StatusBadge status={row.priority} label={row.priority === 'high' ? 'High priority' : undefined} />
}

/** The next orders in line; choosing one makes it the order being picked. */
export default function NextInQueue({ rows, totalItems, onSelect, onViewAll }) {
  return (
    <Card
      title="Next in queue"
      padding="sm"
      actions={
        <Button variant="link" size="sm" onClick={onViewAll}>
          View all {totalItems}
        </Button>
      }
    >
      {rows.length === 0 ? (
        <p className={styles.empty}>No other orders are waiting to be picked.</p>
      ) : (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={row.orderNumber}>
              <button type="button" className={styles.item} onClick={() => onSelect(row.orderNumber)}>
                <span>
                  {row.orderNumber} · {row.customerName} · {pluralize(row.units, 'unit')}
                </span>
                <PriorityBadge row={row} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
