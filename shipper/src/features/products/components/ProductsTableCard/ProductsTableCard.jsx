import clsx from 'clsx'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Checkbox from '@/components/atoms/Checkbox'
import IconButton from '@/components/atoms/IconButton'
import StatusBadge from '@/components/atoms/StatusBadge'
import Thumbnail from '@/components/atoms/Thumbnail'
import BulkActionBar from '@/components/molecules/BulkActionBar'
import ErrorState from '@/components/molecules/ErrorState'
import EmptyState from '@/components/molecules/EmptyState'
import DataTable from '@/components/organisms/DataTable'
import { getErrorMessage } from '@/app/services'
import { formatINR, formatPercent } from '@/lib/format'
import { PRODUCT_PAGE_SIZE } from '@/features/products/hooks/useProductFilters'
import styles from './ProductsTableCard.module.scss'

/** Badge key for a product: hidden products read Inactive, otherwise the stock level the backend reports. */
function statusKeyOf(product) {
  if (product.status === 'inactive') return 'inactive'
  if (product.stockStatus === 'out_of_stock') return 'out_of_stock'
  return product.stockStatus === 'low_stock' ? 'low_stock' : 'active'
}

const toSortState = (sort) => (sort ? { key: sort.replace(/^-/, ''), direction: sort.startsWith('-') ? 'desc' : 'asc' } : null)
const toSortParam = (sort) => (sort ? `${sort.direction === 'desc' ? '-' : ''}${sort.key}` : '')

/**
 * The products table with its toolbar: select-all, Bulk update and Import Excel above, sortable
 * columns, edit and delete per row, and paging. Paging, sorting and filtering are done by the backend.
 */
export default function ProductsTableCard({
  query,
  page,
  sort,
  selectedCodes,
  onSelectionChange,
  onSortChange,
  onPageChange,
  onEdit,
  onDelete,
  onBulkUpdate,
  onImport,
  onClearFilters,
}) {
  const { data, isPending, isError, error, refetch } = query
  const rows = data?.items ?? []
  const pageCodes = rows.map((product) => product.code)
  const selected = new Set(selectedCodes)
  const selectedOnPage = pageCodes.filter((code) => selected.has(code)).length
  const allOnPageSelected = pageCodes.length > 0 && selectedOnPage === pageCodes.length

  const toggleAllOnPage = () => {
    const next = new Set(selected)
    pageCodes.forEach((code) => (allOnPageSelected ? next.delete(code) : next.add(code)))
    onSelectionChange([...next])
  }

  const columns = [
    {
      key: 'thumbnail',
      header: 'Image',
      cell: (product) => (
        <div className={styles.thumb}>
          <Thumbnail src={product.thumbnail} size="sm" />
        </div>
      ),
    },
    { key: 'code', header: 'Code', sortable: true, cell: (product) => <strong>{product.code}</strong> },
    { key: 'name', header: 'Product name', sortable: true },
    { key: 'batch', header: 'Batch' },
    { key: 'hsn', header: 'HSN' },
    { key: 'gstPercent', header: 'GST%', cell: (product) => formatPercent(product.gstPercent) },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      cell: (product) => <span className={clsx(product.stockStatus !== 'in_stock' && styles.lowStock)}>{product.stock}</span>,
    },
    { key: 'pv', header: 'PV', sortable: true },
    { key: 'mrp', header: 'MRP', sortable: true, cell: (product) => formatINR(product.mrp) },
    { key: 'unit', header: 'Unit' },
    { key: 'status', header: 'Status', cell: (product) => <StatusBadge status={statusKeyOf(product)} /> },
    {
      key: 'edit',
      header: 'Edit',
      cell: (product) => <IconButton icon="pencil" tone="primary" size="sm" label={`Edit ${product.name}`} onClick={() => onEdit(product)} />,
    },
    {
      key: 'delete',
      header: (
        <>
          <span aria-hidden="true">Del.</span>
          <span className="visually-hidden">Delete</span>
        </>
      ),
      cell: (product) => <IconButton icon="trash" tone="danger" size="sm" label={`Delete ${product.name}`} onClick={() => onDelete(product)} />,
    },
  ]

  return (
    <Card padding="sm" radius="md" className={styles.card} aria-label="Products">
      <div className={styles.toolbar}>
        <Checkbox
          label="Select all products"
          checked={allOnPageSelected}
          indeterminate={selectedOnPage > 0 && !allOnPageSelected}
          disabled={pageCodes.length === 0}
          onChange={toggleAllOnPage}
        />
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={onBulkUpdate}>
            Bulk update
          </Button>
          <Button variant="secondary" size="sm" onClick={onImport}>
            Import Excel
          </Button>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedCodes.length} itemLabel="product" onClear={() => onSelectionChange([])} />

      {isError && !data ? (
        <ErrorState title="Products could not be loaded" message={getErrorMessage(error)} onRetry={refetch} compact />
      ) : (
        <DataTable
          className={styles.table}
          caption="Products"
          columns={columns}
          rows={rows}
          loading={isPending}
          loadingRows={PRODUCT_PAGE_SIZE}
          getRowId={(product) => product.code}
          getRowLabel={(product) => product.name}
          selectable
          selectedIds={selectedCodes}
          onSelectionChange={onSelectionChange}
          sort={toSortState(sort)}
          onSortChange={(next) => onSortChange(toSortParam(next))}
          minWidth="980px"
          emptyState={
            <EmptyState
              compact
              icon="search"
              title="No products match these filters"
              description="Try a different search or clear the filters."
              action={
                <Button variant="secondary" size="sm" onClick={onClearFilters}>
                  Clear filters
                </Button>
              }
            />
          }
          pagination={{ page, pageSize: PRODUCT_PAGE_SIZE, totalItems: data?.totalItems ?? 0, onPageChange, itemLabel: 'products' }}
        />
      )}
    </Card>
  )
}
