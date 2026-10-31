import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import Spinner from '@/components/atoms/Spinner'
import styles from './Button.module.scss'
/**
* variant: primary | secondary | ghost | danger | link size: sm | md | lg
* Render as a router link with `as={Link} to="/cart"`; a disabled non-button is made inert.
*/
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  children,
  type,
  onClick,
  ...rest
}) {
  const isNativeButton = Component === 'button'
  const isDisabled = disabled || loading
  const handleClick = (event) => {
    if (isDisabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }
  const stateProps = isNativeButton
    ? { type: type ?? 'button', disabled: isDisabled }
    : { 'aria-disabled': isDisabled || undefined, tabIndex: isDisabled ? -1 : undefined }
  return (
    <Component
      className={clsx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...stateProps}
      {...rest}
    >
      {loading ? <Spinner size="sm" decorative /> : leftIcon && <Icon name={leftIcon} />}
      {children}
      {!loading && rightIcon && <Icon name={rightIcon} />}
    </Component>
  )
}