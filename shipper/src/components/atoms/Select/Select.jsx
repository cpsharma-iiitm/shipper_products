import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './Select.module.scss'
/**
* Native <select> with the Shipper control look; use it for short, simple lists.
* For searchable, multi or prefixed dropdowns use the SelectField molecule (react-select).
*/
export default function Select({
  ref,
  size = 'lg',
  variant = 'outline',
  invalid = false,
  className,
  wrapperClassName,
  children,
  ...rest
}) {
  return (
    <div
      className={clsx(styles.wrapper, styles[size], variant === 'filled' && styles.filled, invalid && styles.invalid, wrapperClassName)}
    >
      <select ref={ref} className={clsx(styles.select, className)} aria-invalid={invalid || undefined} {...rest}>
        {children}
      </select>
      <Icon name="chevron-down" className={styles.chevron} />
    </div>
  )
}