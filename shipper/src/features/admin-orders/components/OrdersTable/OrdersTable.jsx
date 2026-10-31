import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Badge from '@/components/atoms/Badge'
import Icon from '@/components/atoms/Icon'
import StatusBadge from '@/components/atoms/StatusBadge'
import DataTable from '@/components/organisms/DataTable'
import { formatDate, formatTime } from '@/lib/date'
import { formatINR, formatNumber } from '@/lib/format'
import styles from './OrdersTable.module.scss'
 
const stacked = (first, second) => (
  <span className={styles.stacked}>
    <span>{first}</span>
    <span className={styles.secondary}>{second}</span>
  </span>
)
 
const COLUMNS = [
  {
    key: 'placedAt',
    header: 'Order / placed',
    sortable: true,
    cell: (row) =>
      stacked(
        <Link to={paths.admin.order(row.orderNumber)} className={styles.orderLink}>
          {row.orderNumber}
        </Link>,
        `${formatDate(row.placedAt)}, ${formatTime(row.placedAt)}`,
      ),
  },
  { key: 'customerName', header: 'Customer', sortable: true, cell: (row) => stacked(row.customerName, `${row.customerCode} · ${row.customerMobile}`) },
  { key: 'units', header: 'Units', sortable: true, cell: (row) => formatNumber(row.units) },
  { key: 'grossAmount', header: 'Amount', sortable: true, cell: (row) => formatINR(row.grossAmount, { decimals: 2 }) },
  {
    key: 'paymentStatus',
    header: 'Payment',
    cell: (row) => (
      <span className={styles.badges}>
        <StatusBadge status={row.paymentStatus} />
        <span className={styles.secondary}>{row.paymentMethod}</span>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    cell: (row) => (
      <span className={styles.badges}>
        <StatusBadge status={row.status} />
        {row.delayed && <Badge tone="danger">Delayed</Badge>}
        {row.onHold && <Badge tone="warning">On hold</Badge>}
      </span>
    ),
  },
]
 
/** The admin order list. Paging, sorting and filtering are the backend's; this shows the current page. */
export default function OrdersTable({ rows, loading, sort, onSortChange, pagination, emptyState, onOpen }) {
  return (
    <DataTable
      caption="Orders"
      columns={COLUMNS}
      rows={rows}
      getRowId={(row) => row.orderNumber}
      loading={loading}
      sort={sort}
      onSortChange={onSortChange}
      pagination={pagination}
      emptyState={emptyState}
      onRowClick={(row) => onOpen(row.orderNumber)}
      rowActions={(row) => (
        <Link to={paths.admin.order(row.orderNumber)} className={styles.viewLink} aria-label={`View order ${row.orderNumber}`}>
          View
          <Icon name="chevron-right" />
        </Link>
      )}
      actionsHeader="Details"
      minWidth="52rem"
    />
  )
}