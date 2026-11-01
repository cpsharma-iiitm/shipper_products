import clsx from 'clsx'
import Card from '@/components/atoms/Card'
import Checkbox from '@/components/atoms/Checkbox'
import ErrorState from '@/components/molecules/ErrorState'
import { Pagination } from '@/components/molecules/Pagination'
import { getErrorMessage } from '@/app/services'
import { formatNumber } from '@/lib/format'
import FlatTable from '@/features/store-operations/components/FlatTable'
import styles from './QueueCard.module.scss'

const orderNumberOf = (row) => row.orderNumber

function footerSummary({ page, pageSize, totalItems, itemLabel }) {
  if (totalItems === 0) return `No ${itemLabel}`
  if (totalItems <= pageSize) return `Showing all ${formatNumber(totalItems)} ${itemLabel}`
  const from = (page - 1) * pageSize + 1
  return `${formatNumber(from)}–${formatNumber(Math.min(page * pageSize, totalItems))} of ${formatNumber(totalItems)} ${itemLabel}`
}

/**
 * The queue table card shared by New Orders, Ready to Dispatch, Dispatched and Delayed Orders.
 *
 * Checking rows selects them for the bulk `actions`; clicking a row (outside its checkbox) focuses just that
 * row. The selection summary under the title doubles as "select all on this page" / "clear".
 * Paging, search and filters are owned by the backend; this card shows the page it is given.
 */
export default function QueueCard({
  title,
  caption,
  itemLabel,
  selectLabel,
  columns,
  rows,
  loading = false,
  error = null,
  onRetry,
  selectedIds,
  onSelectionChange,
  onRowClick,
  rowActions,
  actionsHeader,
  getRowLabel,
  page,
  pageSize,
  totalItems,
  onPageChange,
  actions,
  emptyState,
  children,
  className,
}) {
  const selected = new Set(selectedIds)
  const pageIds = rows.map(orderNumberOf)
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length

  const toggleAll = () => {
    const next = new Set(selected)
    pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
    onSelectionChange([...next])
  }

  return (
    <Card title={title} padding="sm" className={clsx(styles.card, className)}>
      {error ? (
        <ErrorState compact title="Couldn't load this queue" message={getErrorMessage(error)} onRetry={onRetry} />
      ) : (
        <>
          <div className={styles.controls}>
            <Checkbox
              className={clsx(styles.selection, selectedIds.length > 0 && styles.active)}
              label={selectedIds.length > 0 ? `${formatNumber(selectedIds.length)} selected` : selectLabel}
              checked={allSelected}
              indeterminate={selectedOnPage > 0 && !allSelected}
              disabled={loading || rows.length === 0}
              onChange={toggleAll}
            />
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>

          <FlatTable
            caption={caption}
            columns={columns}
            rows={rows}
            getRowId={orderNumberOf}
            getRowLabel={getRowLabel}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            onRowClick={onRowClick}
            rowActions={rowActions}
            actionsHeader={actionsHeader}
            loading={loading}
            loadingRows={Math.min(pageSize, 6)}
            emptyState={emptyState}
          />

          <div className={styles.footer}>
            <p className={styles.summary} aria-live="polite">
              {footerSummary({ page, pageSize, totalItems, itemLabel })}
            </p>
            <Pagination page={page} pageCount={Math.max(1, Math.ceil(totalItems / pageSize))} onPageChange={onPageChange} />
          </div>
          {children}
        </>
      )}
    </Card>
  )
}
