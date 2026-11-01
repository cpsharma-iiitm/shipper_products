import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import StatusBadge from '@/components/atoms/StatusBadge'
import DataTable from '@/components/organisms/DataTable'
import { formatDate } from '@/lib/date'
import { formatINR, formatNumber } from '@/lib/format'
import { OPTIONAL_COLUMNS } from './optionalColumns'
import styles from './FinancialLinesTable.module.scss'

const money = (key) => (row) => formatINR(row[key], { decimals: 2 })

const twoLines = (first, second) => (
  <span className={styles.twoLines}>
    <span>{first}</span>
    <span>{second}</span>
  </span>
)

/** Columns shown by default (as in the design). */
const CORE_COLUMNS = {
  orderDate: {
    key: 'orderDate',
    header: 'Order / date',
    sortable: true,
    cell: (row) =>
      twoLines(
        <Link to={paths.admin.order(row.orderNumber)} className={styles.orderLink}>
          {row.orderNumber}
        </Link>,
        formatDate(row.orderDate),
      ),
  },
  customerName: { key: 'customerName', header: 'Customer', sortable: true },
  product: { key: 'product', header: 'Product / HSN', cell: (row) => twoLines(`${row.productCode} · ${row.productName}`, `${row.hsn} · GST ${row.gstPercent}%`) },
  quantity: { key: 'quantity', header: 'Qty', sortable: true, cell: (row) => formatNumber(row.quantity) },
  taxable: { key: 'taxable', header: 'Taxable', sortable: true, cell: money('taxable') },
  gst: { key: 'gst', header: 'GST', sortable: true, cell: money('gst') },
  lineTotal: { key: 'lineTotal', header: 'Line total', sortable: true, cell: money('lineTotal') },
  status: { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
}

// A table column without the menu-only `label`.
const optional = (key) => {
  const { label: _label, ...column } = OPTIONAL_COLUMNS.find((entry) => entry.key === key)
  return column
}

/**
 * The line-item table of the financial report. Order of columns: taxable value and the GST split next to
 * it, then the line total with shipping, wallet and net payable, then status.
 */
export default function FinancialLinesTable({ rows, visibleOptional, loading, sort, onSortChange, selectedIds, onSelectionChange, pagination, className }) {
  const has = (key) => visibleOptional.includes(key)
  const columns = [
    CORE_COLUMNS.orderDate,
    CORE_COLUMNS.customerName,
    CORE_COLUMNS.product,
    CORE_COLUMNS.quantity,
    CORE_COLUMNS.taxable,
    CORE_COLUMNS.gst,
    ...['cgst', 'sgst', 'igst'].filter(has).map(optional),
    CORE_COLUMNS.lineTotal,
    ...['shipping', 'wallet', 'net'].filter(has).map(optional),
    CORE_COLUMNS.status,
  ]

  return (
    <DataTable
      className={className}
      caption="Financial report: one row per product line, with taxable value, GST and line total"
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      getRowLabel={(row) => `${row.productCode} on order ${row.orderNumber}`}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      sort={sort}
      onSortChange={onSortChange}
      loading={loading}
      loadingRows={4}
      pagination={pagination}
      minWidth="62rem"
    />
  )
}
