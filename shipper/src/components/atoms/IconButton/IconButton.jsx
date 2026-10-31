import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './IconButton.module.scss'
/** Icon-only button; `label` is required because it is the accessible name. tone: neutral | primary | danger. */
export default function IconButton({ icon, label, tone = 'neutral', size = 'md', className, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={clsx(styles.button, styles[tone], styles[size], className)}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  )
}