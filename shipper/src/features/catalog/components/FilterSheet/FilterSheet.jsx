import Button from '@/components/atoms/Button'
import Drawer from '@/components/organisms/Drawer'
import { formatNumber } from '@/lib/format'
import styles from './FilterSheet.module.scss'

/** Mobile filter panel as a bottom sheet. Filters apply as they are chosen; the footer button just closes it. */
export default function FilterSheet({ open, onClose, resultCount, canClear, onClear, children }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      title="Filters"
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClear} disabled={!canClear}>
            Clear all
          </Button>
          <Button className={styles.apply} onClick={onClose}>
            {resultCount === undefined ? 'Show products' : `Show ${formatNumber(resultCount)} products`}
          </Button>
        </div>
      }
    >
      {children}
    </Drawer>
  )
}
