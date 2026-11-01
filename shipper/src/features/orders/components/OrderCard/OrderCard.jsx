import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import Thumbnail from '@/components/atoms/Thumbnail'
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge'
import { getCustomerOrderStatus } from '@/features/orders/constants/orderStatus'
import { getItemsLine, getOrderNote } from '@/features/orders/utils/orderCopy'
import { formatDate } from '@/lib/date'
import { formatINR } from '@/lib/format'
import styles from './OrderCard.module.scss'

const MAX_THUMBNAILS = 4

/**
 * One order in the history list: number, date and gross total, status, the items in it, a one-line status
 * note and the actions (track / view details, reorder; the invoice link sits in the header beside the status). Every figure is shown as the backend sent it.
 */
export default function OrderCard({ order, onReorder, onDownloadInvoice, invoiceLoading = false }) {
  const visibleItems = order.items.slice(0, MAX_THUMBNAILS)
  const hiddenCount = order.items.length - visibleItems.length
  const note = getOrderNote(order)
  const isShipped = getCustomerOrderStatus(order.status).stage === 'shipped'

  return (
    <article className={styles.card} aria-label={`Order ${order.orderNumber}`}>
      <header className={styles.header}>
        <h2 className={styles.number}>Order #{order.orderNumber}</h2>
        <p className={styles.meta}>
          Placed {formatDate(order.placedAt)} · Gross total {formatINR(order.grossAmount, { decimals: 2 })}
        </p>
        {order.hasInvoice && (
          <Button variant="link" size="sm" leftIcon="download" loading={invoiceLoading} className={styles.invoice} onClick={() => onDownloadInvoice(order.orderNumber)}>
            Download invoice
          </Button>
        )}
        <OrderStatusBadge status={order.status} className={styles.status} />
      </header>

      <div className={styles.body}>
        <ul className={styles.thumbnails} aria-label="Items in this order">
          {visibleItems.map((item) => (
            <li key={item.productCode}>
              <Thumbnail src={item.image} alt={item.name} size={82} />
            </li>
          ))}
          {hiddenCount > 0 && (
            <li className={styles.more} aria-label={`${hiddenCount} more items`}>
              +{hiddenCount}
            </li>
          )}
        </ul>

        <div className={styles.summary}>
          <p className={styles.items}>{getItemsLine(order)}</p>
          <p className={clsx(styles.note, styles[note.tone])}>{note.text}</p>
        </div>

        <div className={styles.actions}>
          <Button as={Link} to={paths.order(order.orderNumber)} size="sm" rightIcon="arrow-right">
            {isShipped ? 'Track order' : 'View details'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onReorder(order)}>
            Reorder
          </Button>
        </div>
      </div>
    </article>
  )
}
