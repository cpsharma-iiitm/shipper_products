import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './QuantityStepper.module.scss'

/**
 * "− 1 +" control. `max` is an optional UI limit supplied by the caller (for example the
 * backend-reported purchase limit); this component does not know about stock.
 * The number is typeable: it commits on blur or Enter and reverts if the entry is not a number.
 */
export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = 'md',
  disabled = false,
  label = 'Quantity',
  className,
}) {
  const clamp = (number) => Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, number))

  const commit = (event) => {
    const parsed = Number.parseInt(event.target.value, 10)
    const next = Number.isNaN(parsed) ? value : clamp(parsed)
    if (next === value) {
      event.target.value = String(value)
      return
    }
    onChange(next)
  }

  return (
    <div role="group" aria-label={label} className={clsx(styles.stepper, styles[size], disabled && styles.disabled, className)}>
      <button
        type="button"
        className={styles.button}
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Icon name="dash" />
      </button>
      <input
        key={value}
        className={styles.input}
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={label}
        defaultValue={value}
        disabled={disabled}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
      />
      <button
        type="button"
        className={styles.button}
        aria-label="Increase quantity"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Icon name="plus" />
      </button>
    </div>
  )
}