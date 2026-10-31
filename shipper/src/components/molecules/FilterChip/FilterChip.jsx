import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './FilterChip.module.scss'
/** Applied-filter pill with a remove button: "Haldi ×". */
export default function FilterChip({ label, onRemove, className }) {
  return (
    <span className={clsx(styles.chip, className)}>
      {label}
      <button type="button" className={styles.remove} aria-label={`Remove filter: ${label}`} onClick={onRemove}>
        <Icon name="x" />
      </button>
    </span>
  )
}