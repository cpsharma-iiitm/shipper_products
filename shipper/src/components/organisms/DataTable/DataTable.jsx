import { useMemo } from 'react'
import clsx from 'clsx'
import Checkbox from '@/components/atoms/Checkbox'
import Icon from '@/components/atoms/Icon'
import Skeleton from '@/components/atoms/Skeleton'
import EmptyState from '@/components/molecules/EmptyState'
import { PaginationBar } from '@/components/molecules/Pagination'
import styles from './DataTable.module.scss'
const NEXT_DIRECTION = { none: 'asc', asc: 'desc', desc: null }
const SORT_ARIA = { none: 'none', asc: 'ascending', desc: 'descending' }
const SORT_ICON = { none: 'arrow-down-up', asc: 'arrow-up', desc: 'arrow-down' }
const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, label, [role="button"]'
/**
* Presentational table for admin lists. Paging, sorting and filtering are owned by the backend:
* this component displays the current page and reports user intent through callbacks.
*
* columns: [{ key, header, cell?(row), sortable?, align?: 'left'|'right'|'center', width?, className? }]
*   `cell` defaults to row[key]. A sortable column cycles ascending → descending → cleared.
* sort:    { key, direction: 'asc' | 'desc' } | null          onSortChange(sort | null)
* selection (optional): selectable + selectedIds + onSelectionChange(ids). "Select all" acts on the
*   rows currently shown and keeps selections made on other pages.
* rowActions(row): node rendered in a trailing column (IconButtons, a menu trigger, …).
* onRowClick(row): mouse convenience; keep a real link or button in the row for keyboard users.
* pagination: { page, pageSize, totalItems, onPageChange, itemLabel }
* maxHeight: gives the table its own vertical scroll area and keeps the header pinned.
*/
export default function DataTable({
  caption,
  columns,
  rows,
  getRowId = (row) => row.id,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowLabel,
  sort = null,
  onSortChange,
  rowActions,
  actionsHeader = 'Actions',
  onRowClick,
  loading = false,
  loadingRows = 6,
  emptyState,
  pagination,
  maxHeight,
  minWidth = '720px',
  className,
}) {
  const selected = useMemo(() => new Set(selectedIds), [selectedIds])
  const pageIds = useMemo(() => rows.map(getRowId), [rows, getRowId])
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someSelected = pageIds.some((id) => selected.has(id))
  const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)
  const toggleAll = () => {
    const next = new Set(selected)
    pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
    onSelectionChange?.([...next])
  }
  const toggleRow = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange?.([...next])
  }
  const cycleSort = (key) => {
    const current = sort?.key === key ? sort.direction : 'none'
    const direction = NEXT_DIRECTION[current]
    onSortChange?.(direction ? { key, direction } : null)
  }
  const handleRowClick = (event, row) => {
    if (event.target.closest(INTERACTIVE_SELECTOR)) return
    onRowClick(row)
  }
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.scroll} style={{ maxHeight }}>
        <table className={styles.table} style={{ minWidth }} aria-busy={loading || undefined}>
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className={styles.selectCell}>
                  <Checkbox
                    aria-label="Select all rows on this page"
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    disabled={loading || pageIds.length === 0}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((column) => {
                const direction = sort?.key === column.key ? sort.direction : 'none'
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={column.sortable ? SORT_ARIA[direction] : undefined}
                    className={clsx(styles[column.align], column.className)}
                    style={{ width: column.width }}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className={clsx(styles.sortButton, direction !== 'none' && styles.sorted)}
                        onClick={() => cycleSort(column.key)}
                      >
                        {column.header}
                        <Icon name={SORT_ICON[direction]} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
              {rowActions && (
                <th scope="col" className={styles.actionsCell}>
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: loadingRows }, (_, rowIndex) => (
                <tr key={`loading-${rowIndex}`}>
                  {Array.from({ length: columnCount }, (_, cellIndex) => (
                    <td key={cellIndex}>
                      <Skeleton height="0.875rem" width={`${55 + ((rowIndex * 7 + cellIndex * 13) % 40)}%`} />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columnCount} className={styles.empty}>
                  {emptyState ?? (
                    <EmptyState
                      compact
                      icon="search"
                      title="No results found"
                      description="Try changing or clearing your filters."
                    />
                  )}
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => {
                const id = getRowId(row)
                const isSelected = selected.has(id)
                return (
                  <tr
                    key={id}
                    className={clsx(isSelected && styles.selectedRow, onRowClick && styles.clickable)}
                    onClick={onRowClick ? (event) => handleRowClick(event, row) : undefined}
                  >
                    {selectable && (
                      <td className={styles.selectCell}>
                        <Checkbox
                          aria-label={getRowLabel ? `Select ${getRowLabel(row)}` : 'Select row'}
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className={clsx(styles[column.align], column.className)}>
                        {column.cell ? column.cell(row) : row[column.key]}
                      </td>
                    ))}
                    {rowActions && <td className={styles.actionsCell}>{rowActions(row)}</td>}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className={styles.footer}>
          <PaginationBar {...pagination} />
        </div>
      )}
    </div>
  )
}