import clsx from 'clsx'
import Button from '@/components/atoms/Button'
import { pluralize } from '@/lib/format'
import styles from './BulkActionBar.module.scss'
/**
* Shown above a table while rows are selected: "3 selected · Clear" plus the action buttons passed
* as `children`. Renders nothing for an empty selection.
*/
export default function BulkActionBar({ selectedCount, itemLabel = 'item', onClear, className, children }) {
  if (selectedCount <= 0) return null
  return (
    <div role="region" aria-label="Bulk actions" className={clsx(styles.bar, className)}>
      <p className={styles.count} aria-live="polite">
        {pluralize(selectedCount, itemLabel)} selected
      </p>
      <Button variant="link" size="sm" onClick={onClear}>
        Clear selection
      </Button>
      <div className={styles.actions}>{children}</div>
    </div>
  )
}