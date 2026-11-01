import clsx from 'clsx'
import Button from '@/components/atoms/Button'
import styles from './ReorderStrip.module.scss'

/** "Keep your everyday favourites close." with the reorder action. */
export default function ReorderStrip({ onReorder, disabled = false, className }) {
  return (
    <div className={clsx(styles.strip, className)}>
      <p className={styles.text}>Keep your everyday favourites close.</p>
      <Button variant="secondary" size="sm" disabled={disabled} onClick={onReorder}>
        Reorder these items
      </Button>
    </div>
  )
}
