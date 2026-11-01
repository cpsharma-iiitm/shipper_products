import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import StatusBadge from '@/components/atoms/StatusBadge'
import Thumbnail from '@/components/atoms/Thumbnail'
import DataTable from '@/components/organisms/DataTable'
import { parseQuantity } from '@/features/inventory/lib/quantity'
import { formatNumber } from '@/lib/format'
import styles from './RestockTable.module.scss'

const LEVEL_STATUS = { low: 'low_stock', out: 'out_of_stock' }

/**
 * Products at or below their reorder level. The order quantity starts at the backend's suggestion and can be
 * changed per row; "Request restock" raises a request for the purchasing team.
 */
export default function RestockTable({
  rows,
  loading,
  sort,
  onSortChange,
  pagination,
  emptyState,
  selectedIds,
  onSelectionChange,
  quantityOf,
  onQuantityChange,
  onRequestRestock,
  requesting,
}) {
  const columns = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      className: styles.productColumn,
      cell: (row) => (
        <span className={styles.product}>
          <Thumbnail src={row.thumbnail} size="sm" />
          <span className={styles.stacked}>
            <span className={styles.name}>{row.name}</span>
            <span className={styles.secondary}>
              {row.unit} · {row.productCode}
            </span>
          </span>
        </span>
      ),
    },
    { key: 'categoryLabel', header: 'Category', sortable: true, className: styles.nowrap },
    { key: 'bin', header: 'Bin', className: styles.nowrap, cell: (row) => row.bin || '—' },
    { key: 'stock', header: 'In stock', sortable: true, align: 'right', cell: (row) => formatNumber(row.stock) },
    { key: 'lowStockThreshold', header: 'Reorder level', align: 'right', cell: (row) => formatNumber(row.lowStockThreshold) },
    { key: 'level', header: 'Status', cell: (row) => <StatusBadge status={LEVEL_STATUS[row.level]} /> },
    {
      key: 'quantity',
      header: 'Order quantity',
      cell: (row) => {
        const value = quantityOf(row)
        const invalid = parseQuantity(value) === null
        return (
          <Input
            size="sm"
            type="text"
            inputMode="numeric"
            wrapperClassName={styles.quantity}
            aria-label={`Order quantity for ${row.name}`}
            value={value}
            invalid={invalid}
            onChange={(event) => onQuantityChange(row.productCode, event.target.value)}
          />
        )
      },
    },
  ]

  return (
    <DataTable
      caption="Products to restock"
      columns={columns}
      rows={rows}
      getRowId={(row) => row.productCode}
      getRowLabel={(row) => row.name}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      loading={loading}
      sort={sort}
      onSortChange={onSortChange}
      pagination={pagination}
      emptyState={emptyState}
      actionsHeader="Restock"
      minWidth="64rem"
      rowActions={(row) =>
        row.requestedQuantity ? (
          <Badge tone="info">Requested · {formatNumber(row.requestedQuantity)} units</Badge>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            leftIcon="box-arrow-in-down"
            disabled={requesting || parseQuantity(quantityOf(row)) === null}
            onClick={() => onRequestRestock(row)}
          >
            Request restock
          </Button>
        )
      }
    />
  )
}
