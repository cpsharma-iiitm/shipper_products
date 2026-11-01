import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Card from '@/components/atoms/Card'
import StatusBadge from '@/components/atoms/StatusBadge'
import DataTable from '@/components/organisms/DataTable'
import { formatDate } from '@/lib/date'
import { formatINR, pluralize } from '@/lib/format'
import styles from './RecentOrdersCard.module.scss'

const COLUMNS = [
  {
    key: 'orderNumber',
    header: 'Order',
    cell: (order) => (
      <Link to={paths.admin.order(order.orderNumber)} className={styles.orderLink}>
        {order.orderNumber}
      </Link>
    ),
  },
  { key: 'customerName', header: 'Customer' },
  { key: 'placedAt', header: 'Placed on', cell: (order) => formatDate(order.placedAt) },
  { key: 'grossAmount', header: 'Gross', cell: (order) => formatINR(order.grossAmount) },
  { key: 'paymentStatus', header: 'Payment', cell: (order) => <StatusBadge status={order.paymentStatus} /> },
  { key: 'status', header: 'Status', cell: (order) => <StatusBadge status={order.status} /> },
]

/** The latest orders across the store. `orders` is null while the first response is loading. */
export default function RecentOrdersCard({ orders }) {
  return (
    <Card title="Recent orders" radius="md" padding="sm" className={styles.card}>
      <DataTable
        className={styles.table}
        caption="Recent orders"
        columns={COLUMNS}
        rows={orders ?? []}
        loading={!orders}
        loadingRows={4}
        getRowId={(order) => order.orderNumber}
        minWidth="640px"
      />
      <div className={styles.footer}>
        <p className={styles.note}>
          Latest {pluralize(orders?.length ?? 0, 'order')} · Updated just now
        </p>
        <Link to={paths.admin.orders} className={styles.link}>
          View all orders <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Card>
  )
}
