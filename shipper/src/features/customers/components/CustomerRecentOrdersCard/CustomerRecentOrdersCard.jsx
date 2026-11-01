import { Link, useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import StatusBadge from '@/components/atoms/StatusBadge'
import EmptyState from '@/components/molecules/EmptyState'
import DataTable from '@/components/organisms/DataTable'
import { formatDate } from '@/lib/date'
import { formatINR, formatNumber } from '@/lib/format'
import styles from './CustomerRecentOrdersCard.module.scss'

const COLUMNS = [
  {
    key: 'orderNumber',
    header: 'Order',
    cell: (row) => (
      <Link to={paths.admin.order(row.orderNumber)} className={styles.orderLink}>
        {row.orderNumber}
      </Link>
    ),
  },
  { key: 'placedAt', header: 'Placed', cell: (row) => formatDate(row.placedAt) },
  { key: 'units', header: 'Units', cell: (row) => formatNumber(row.units) },
  { key: 'grossAmount', header: 'Amount', align: 'right', cell: (row) => formatINR(row.grossAmount, { decimals: 2 }) },
  { key: 'paymentStatus', header: 'Payment', cell: (row) => <StatusBadge status={row.paymentStatus} /> },
  { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
]

/** The customer's latest orders, each opening the admin order detail. */
export default function CustomerRecentOrdersCard({ orders, customerCode }) {
  const navigate = useNavigate()

  return (
    <Card
      title="Recent orders"
      padding="md"
      radius="md"
      actions={
        <Link to={`${paths.admin.orders}?q=${encodeURIComponent(customerCode)}`} className={styles.allLink}>
          View all orders
          <Icon name="arrow-right" />
        </Link>
      }
    >
      <DataTable
        caption="Recent orders"
        columns={COLUMNS}
        rows={orders}
        getRowId={(row) => row.orderNumber}
        onRowClick={(row) => navigate(paths.admin.order(row.orderNumber))}
        emptyState={<EmptyState compact icon="bag" title="No orders yet" description="Orders this customer places will show up here." />}
        minWidth="40rem"
      />
    </Card>
  )
}
