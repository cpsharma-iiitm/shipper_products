import clsx from 'clsx'
import Skeleton from '@/components/atoms/Skeleton'
import StatusBadge from '@/components/atoms/StatusBadge'
import EmptyState from '@/components/molecules/EmptyState'
import Drawer from '@/components/organisms/Drawer'
import { pluralize } from '@/lib/format'
import styles from './QueueDrawer.module.scss'

/**
 * Every order waiting in a stage, for jumping to one out of turn (To Pick and To Pack work one order at a
 * time, so the queue itself is not on screen). Choosing an order closes the drawer.
 */
export default function QueueDrawer({ open, onClose, title, description, rows, loading, activeOrderNumber, onSelect }) {
  return (
    <Drawer open={open} onClose={onClose} title={title} description={description}>
      {loading ? (
        <div className={styles.loading}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} height="3.25rem" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState compact icon="inbox" title="Queue is empty" description="No orders are waiting here." />
      ) : (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={row.orderNumber}>
              <button
                type="button"
                className={clsx(styles.item, row.orderNumber === activeOrderNumber && styles.active)}
                aria-current={row.orderNumber === activeOrderNumber ? 'true' : undefined}
                onClick={() => {
                  onSelect(row.orderNumber)
                  onClose()
                }}
              >
                <span className={styles.main}>
                  <span className={styles.order}>{row.orderNumber} · {row.customerName}</span>
                  <span className={styles.meta}>
                    {pluralize(row.units, 'unit')} · {row.assignee}
                  </span>
                </span>
                {row.onHold ? <StatusBadge status="on_hold" /> : row.priority !== 'standard' && <StatusBadge status={row.priority} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}
