import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Icon from '@/components/atoms/Icon'
import StatusBadge from '@/components/atoms/StatusBadge'
import DataTable from '@/components/organisms/DataTable'
import { formatDate } from '@/lib/date'
import { formatINR, formatNumber } from '@/lib/format'
import { formatMobile } from '@/lib/address'
import styles from './CustomersTable.module.scss'

const COLUMNS = [
  {
    key: 'name',
    header: 'Customer',
    sortable: true,
    cell: (row) => (
      <span className={styles.stacked}>
        <Link to={paths.admin.customer(row.code)} className={styles.nameLink}>
          {row.name}
        </Link>
        <span className={styles.secondary}>{row.code}</span>
      </span>
    ),
  },
  {
    key: 'mobile',
    header: 'Contact',
    cell: (row) => (
      <span className={styles.stacked}>
        <span>{row.mobile ? formatMobile(row.mobile) : '—'}</span>
        <span className={styles.secondary}>{row.email}</span>
      </span>
    ),
  },
  { key: 'city', header: 'City', sortable: true, cell: (row) => row.city || '—' },
  { key: 'ordersCount', header: 'Orders', sortable: true, align: 'right', cell: (row) => formatNumber(row.ordersCount) },
  { key: 'totalSpend', header: 'Total spend', sortable: true, align: 'right', cell: (row) => formatINR(row.totalSpend, { decimals: 2 }) },
  { key: 'walletBalance', header: 'Wallet', sortable: true, align: 'right', cell: (row) => formatINR(row.walletBalance, { decimals: 2 }) },
  { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  { key: 'joinedAt', header: 'Joined', sortable: true, cell: (row) => formatDate(row.joinedAt) },
]

/** The admin customer list. Paging, sorting and filtering are the backend's; this shows the current page. */
export default function CustomersTable({ rows, loading, sort, onSortChange, pagination, emptyState, onOpen }) {
  return (
    <DataTable
      caption="Customers"
      columns={COLUMNS}
      rows={rows}
      getRowId={(row) => row.code}
      loading={loading}
      sort={sort}
      onSortChange={onSortChange}
      pagination={pagination}
      emptyState={emptyState}
      onRowClick={(row) => onOpen(row.code)}
      rowActions={(row) => (
        <Link to={paths.admin.customer(row.code)} className={styles.viewLink} aria-label={`View ${row.name}`}>
          View
          <Icon name="chevron-right" />
        </Link>
      )}
      actionsHeader="Details"
      minWidth="58rem"
    />
  )
}
