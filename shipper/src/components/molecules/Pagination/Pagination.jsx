import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import { formatNumber } from '@/lib/format'
import { getPageRange } from '@/lib/pagination'
import styles from './Pagination.module.scss'
/** Page buttons: ‹ 1 2 3 ›. Renders nothing when there is a single page. */
export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, className }) {
  if (pageCount <= 1) return null
  return (
    <nav aria-label="Pagination" className={className}>
      <ul className={styles.list}>
        <li>
          <button
            type="button"
            className={styles.item}
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <Icon name="chevron-left" />
          </button>
        </li>
        {getPageRange(page, pageCount, siblingCount).map((entry) =>
          typeof entry === 'string' ? (
            <li key={entry} aria-hidden="true" className={styles.ellipsis}>
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                className={clsx(styles.item, entry === page && styles.active)}
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? 'page' : undefined}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className={styles.item}
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <Icon name="chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  )
}
/**
* Footer for grids and tables: "Showing 1–6 of 126 products" on the left, page buttons on the right.
* Page numbers are 1-based. The backend owns paging; `totalItems` comes from its response.
*/
export default function PaginationBar({ page, pageSize, totalItems, onPageChange, itemLabel = 'items', className }) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)
  return (
    <div className={clsx(styles.bar, className)}>
      <p className={styles.summary} aria-live="polite">
        {totalItems === 0
          ? `No ${itemLabel}`
          : `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(totalItems)} ${itemLabel}`}
      </p>
      <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
    </div>
  )
}