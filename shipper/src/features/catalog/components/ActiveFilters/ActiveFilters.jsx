import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './ActiveFilters.module.scss'

/** Applied filters as removable text chips ("In stock ×"), with an optional "Clear" for all of them. */
export default function ActiveFilters({ filters, onRemove, onClear, className }) {
  if (filters.length === 0) return null

  return (
    <ul className={clsx(styles.list, className)} aria-label="Applied filters">
      {filters.map((filter) => (
        <li key={filter.id}>
          <button type="button" className={styles.chip} aria-label={`Remove filter: ${filter.label}`} onClick={() => onRemove(filter)}>
            {filter.label}
            <Icon name="x-lg" />
          </button>
        </li>
      ))}
      {onClear && (
        <li>
          <button type="button" className={styles.clear} onClick={onClear}>
            Clear
          </button>
        </li>
      )}
    </ul>
  )
}
