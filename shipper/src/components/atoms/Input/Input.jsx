import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './Input.module.scss'
/**
* Text input. size: sm | md | lg (forms use lg) variant: outline | filled
* Pass `invalid` for the error state. `ref` reaches the <input> (React Hook Form's register works).
*/
export default function Input({
  ref,
  size = 'lg',
  variant = 'outline',
  invalid = false,
  leftIcon,
  rightSlot,
  type = 'text',
  className,
  wrapperClassName,
  ...rest
}) {
  return (
    <div
      className={clsx(styles.wrapper, styles[size], variant === 'filled' && styles.filled, invalid && styles.invalid, wrapperClassName)}
    >
      {leftIcon && <Icon name={leftIcon} className={styles.leftIcon} />}
      <input
        ref={ref}
        type={type}
        className={clsx(styles.input, leftIcon && styles.hasLeftIcon, className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {rightSlot && <span className={styles.rightSlot}>{rightSlot}</span>}
    </div>
  )
}